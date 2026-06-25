from django.urls import path

from . import views

urlpatterns = [
    path("auth/nonce/", views.NonceView.as_view()),
    path("auth/verify/", views.VerifyView.as_view()),
    path("auth/me/", views.MeView.as_view()),
    path("notes/", views.NoteListCreateView.as_view()),
    path("profiles/<int:id>/", views.ProfileDetailView.as_view()),
]
