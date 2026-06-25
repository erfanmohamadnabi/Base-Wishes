from rest_framework import serializers

from .models import Note, Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "id",
            "wallet_address",
            "display_name",
            "bio",
            "twitter_url",
            "github_url",
            "avatar",
            "created_at",
        ]
        read_only_fields = ["wallet_address", "created_at"]


class NoteSerializer(serializers.ModelSerializer):
    author = ProfileSerializer(read_only=True)

    class Meta:
        model = Note
        fields = ["id", "text", "tx_hash", "chain_id", "created_at", "author"]
        read_only_fields = ["id", "created_at", "author"]

    def validate_tx_hash(self, value):
        if not value.startswith("0x") or len(value) != 66:
            raise serializers.ValidationError("tx_hash must be a 32-byte 0x-prefixed hash.")
        return value.lower()
