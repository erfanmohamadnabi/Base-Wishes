import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NoteCard from "../components/NoteCard";
import ProfileEditForm from "../components/ProfileEditForm";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { colorFromAddress, shortenAddress } from "../lib/format";

export default function Profile() {
  const { id } = useParams();
  const { profile: myProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);

  // const isOwnProfile = myProfile?.wallet_address === address.toLowerCase();

  const isOwnProfile = myProfile?.wallet_address && profile?.wallet_address && myProfile.wallet_address.toLowerCase() === profile.wallet_address.toLowerCase();

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    Promise.all([
      api.get(`/profiles/${id}/`),
      api.get(`/notes/?author_id=${id}`)
    ])
      .then(([profileRes, notesRes]) => {
        setProfile(profileRes.data);
        setNotes(notesRes.data.results ?? notesRes.data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container empty-state">Loading ...</div>;
  if (notFound || !profile) {
    return <div className="container empty-state">This profile was not found!</div>;
  }

  const displayName = profile.display_name || shortenAddress(profile.wallet_address);

  return (
    <div className="container">
      <div className="profile-header">
        <span
          className="profile-avatar"
          style={{
            background: profile.avatar
              ? `url(${profile.avatar})`
              : colorFromAddress(profile.wallet_address),
          }}
        />
        <div>
          <h1 className="profile-name">{displayName}</h1>
          {/* <p className="profile-address">{profile.wallet_address}</p> */}
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-links">
            {profile.twitter_url && (
              <a className="profile-link" href={profile.twitter_url} target="_blank" rel="noreferrer">
                Twitter / X
              </a>
            )}
            {profile.github_url && (
              <a className="profile-link" href={profile.github_url} target="_blank" rel="noreferrer">
                GitHub
              </a>
            )}
            {isOwnProfile && (
              <button className="profile-link" onClick={() => setEditing((v) => !v)}>
                {editing ? "Close edit" : "Edit profile"}
              </button>
            )}
          </div>
        </div>
      </div>

      {isOwnProfile && editing && (
        <ProfileEditForm profile={profile} onSaved={(data) => { setProfile(data); setEditing(false); }} />
      )}

      <p className="section-title">Notes ({notes.length})</p>

      {notes.length === 0 && <p className="empty-state">No notes yet</p>}

      <div className="feed">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
