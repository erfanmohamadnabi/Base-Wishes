from django.contrib import admin

from .models import Note, Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["wallet_address", "display_name", "created_at"]
    search_fields = ["wallet_address", "display_name"]


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ["author", "text", "tx_hash", "chain_id", "created_at"]
    search_fields = ["text", "tx_hash"]
    list_filter = ["chain_id"]
