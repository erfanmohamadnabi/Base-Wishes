from django.core.validators import RegexValidator
from django.db import models

wallet_address_validator = RegexValidator(
    regex=r"^0x[a-f0-9]{40}$",
    message="wallet_address must be a lowercase 0x-prefixed 40 hex char address.",
)


class Profile(models.Model):
    """
    There is no username/password here on purpose: identity is the wallet
    address, proved by a signature (see notes/views.py NonceView/VerifyView).
    Always store wallet_address lowercased to avoid case-mismatch bugs.
    """

    wallet_address = models.CharField(
        max_length=42,
        unique=True,
        db_index=True,
        validators=[wallet_address_validator],
    )
    display_name = models.CharField(max_length=80, blank=True)
    bio = models.CharField(max_length=280, blank=True)
    twitter_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    # One-time challenge used during the sign-in flow. Cleared after use.
    nonce = models.CharField(max_length=64, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # Lets DRF's IsAuthenticated permission treat a Profile like a "user"
    # without pulling in django.contrib.auth's User model at all.
    is_authenticated = True
    is_anonymous = False

    def __str__(self):
        return self.display_name or self.wallet_address

    def save(self, *args, **kwargs):
        if self.wallet_address:
            self.wallet_address = self.wallet_address.lower()
        super().save(*args, **kwargs)


class Note(models.Model):
    author = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="notes")
    text = models.CharField(max_length=280)

    # The on-chain proof: the tx that actually wrote this note to BaseWishes.
    tx_hash = models.CharField(max_length=66, unique=True)
    chain_id = models.CharField(max_length=10, default="84532")  # Base Sepolia by default

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author.wallet_address}: {self.text[:40]}"
