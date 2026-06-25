import secrets

from django.shortcuts import get_object_or_404
from eth_account import Account
from eth_account.messages import encode_defunct
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Note, Profile
from .serializers import NoteSerializer, ProfileSerializer


def build_sign_message(nonce: str) -> str:
    return (
        "Sign in to Base Wishes\n\n"
        "This only proves you own this wallet. It will not trigger a "
        "transaction and costs no gas.\n\n"
        f"Nonce: {nonce}"
    )


class NonceView(APIView):
    """Step 1 of sign-in: client asks for a message to sign."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        wallet_address = (request.data.get("wallet_address") or "").lower()
        if not wallet_address:
            return Response({"detail": "wallet_address is required"}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = Profile.objects.get_or_create(wallet_address=wallet_address)
        nonce = secrets.token_hex(16)
        profile.nonce = nonce
        profile.save(update_fields=["nonce"])

        return Response({"message": build_sign_message(nonce)})


class VerifyView(APIView):
    """Step 2 of sign-in: client sends back the signature, we recover the
    signing address and check it matches, then issue a JWT pair."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        wallet_address = (request.data.get("wallet_address") or "").lower()
        signature = request.data.get("signature")

        if not wallet_address or not signature:
            return Response(
                {"detail": "wallet_address and signature are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            profile = Profile.objects.get(wallet_address=wallet_address)
        except Profile.DoesNotExist:
            return Response({"detail": "Unknown wallet, request a nonce first"}, status=status.HTTP_400_BAD_REQUEST)

        if not profile.nonce:
            return Response({"detail": "No pending nonce, request a new one"}, status=status.HTTP_400_BAD_REQUEST)

        message = build_sign_message(profile.nonce)
        try:
            recovered_address = Account.recover_message(encode_defunct(text=message), signature=signature)
        except Exception:
            return Response({"detail": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        if recovered_address.lower() != wallet_address:
            return Response({"detail": "Signature does not match wallet_address"}, status=status.HTTP_400_BAD_REQUEST)

        # One-time use: clear the nonce so the same signature can't be replayed.
        profile.nonce = ""
        profile.save(update_fields=["nonce"])

        refresh = RefreshToken.for_user(profile)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "profile": ProfileSerializer(profile, context={"request": request}).data,
            }
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(ProfileSerializer(request.user, context={"request": request}).data)


class NoteListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/notes/             -> public feed, newest first
    GET  /api/notes/?author=0x.. -> a single wallet's notes
    POST /api/notes/             -> create a note record (auth required).
         The on-chain transaction must already have been sent by the
         frontend; this just stores the off-chain copy + tx_hash for display.
    """

    serializer_class = NoteSerializer
    queryset = Note.objects.select_related("author").all()

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = super().get_queryset()

        author_id = self.request.query_params.get("author_id")

        if author_id:
            qs = qs.filter(author_id=author_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/profiles/<wallet_address>/  -> public profile
    PATCH /api/profiles/<wallet_address>/  -> edit your own profile (auth + ownership required)
    """

    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    lookup_field = "id"

    def get_object(self):
        return get_object_or_404(Profile, id=self.kwargs["id"])

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.wallet_address.lower() != request.user.wallet_address.lower():
            return Response({"detail": "You can only edit your own profile"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
