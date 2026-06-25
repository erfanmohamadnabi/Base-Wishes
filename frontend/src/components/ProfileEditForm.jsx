import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function ProfileEditForm({ profile, onSaved }) {
  const { setProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [twitterUrl, setTwitterUrl] = useState(profile.twitter_url || "");
  const [githubUrl, setGithubUrl] = useState(profile.github_url || "");
  const [avatarFile, setAvatarFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append("display_name", displayName);
      formData.append("bio", bio);
      formData.append("twitter_url", twitterUrl);
      formData.append("github_url", githubUrl);
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await api.patch(`/profiles/${profile.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(data);
      setSaved(true);
      onSaved?.(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save profile!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Edit profile</h2>
      <p className="form-sub">This information is displayed on your public profile</p>

      <div className="field">
        <label htmlFor="avatar">Profile picture</label>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="field">
        <label htmlFor="display-name">display name</label>
        <input
          id="display-name"
          maxLength={80}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="For example: Alex"
        />
      </div>

      <div className="field">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          rows={2}
          maxLength={280}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A line about yourself"
        />
      </div>

      <div className="field">
        <label htmlFor="twitter">Twitter link / X</label>
        <input
          id="twitter"
          type="url"
          value={twitterUrl}
          onChange={(e) => setTwitterUrl(e.target.value)}
          placeholder="https://x.com/username"
        />
      </div>

      <div className="field">
        <label htmlFor="github">GitHub link</label>
        <input
          id="github"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username"
        />
      </div>

      <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
        {saving && <span className="spinner" />}
        {saving ? "Saving..." : "Save profile"}
      </button>

      {saved && <div className="success-box">Profile updated.</div>}
      {error && <div className="error-box">{error}</div>}
    </form>
  );
}
