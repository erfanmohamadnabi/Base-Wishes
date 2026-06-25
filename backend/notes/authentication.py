from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.settings import api_settings

from .models import Profile


class WalletJWTAuthentication(JWTAuthentication):
    """
    Same JWT mechanics as simplejwt, but the token's user id maps to our
    wallet-based Profile model instead of django.contrib.auth's User.
    """

    def get_user(self, validated_token):
        try:
            profile_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise AuthenticationFailed("Token contained no recognizable user identification")

        try:
            return Profile.objects.get(pk=profile_id)
        except Profile.DoesNotExist:
            raise AuthenticationFailed("Profile not found for this token")
