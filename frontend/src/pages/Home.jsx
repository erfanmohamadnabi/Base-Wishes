import { useEffect, useState } from "react";
import NoteCard from "../components/NoteCard";
import { api } from "../lib/api";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    api
      .get("/notes/")
      .then(({ data }) => {
        setNotes(data.results ?? data);
        setNextUrl(data.next ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get(nextUrl);
      setNotes((prev) => [...prev, ...data.results]);
      setNextUrl(data.next);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <p className="eyebrow">Before the airdrop</p>
        <h1>What's your plan for your Base airdrop?</h1>
        <p>
          Write your note, register it on Base with a very cheap transaction, and later see who kept their word.
        </p>
      </div>

      {loading && <p className="empty-state">Loading...</p>}

      {!loading && notes.length === 0 && (
        <p className="empty-state">No notes have been submitted yet. Be the first!</p>
      )}

      <div className="feed">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {nextUrl && (
        <button className="btn btn-ghost load-more" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? "Loading..." : "See more"}
        </button>
      )}
    </div>
  );
}
