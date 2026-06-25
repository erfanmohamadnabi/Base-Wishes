import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { submitWishOnChain } from "../lib/wallet";

const MAX_LENGTH = 280;

export default function AddNoteForm() {
  const { profile, token } = useAuth();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [stage, setStage] = useState("idle"); // idle | signing | saving | done
  const [error, setError] = useState(null);

  const overLimit = text.length > MAX_LENGTH;
  const busy = stage === "signing" || stage === "saving";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || overLimit || busy) return;

    setError(null);
    try {
      setStage("signing");
      const txHash = await submitWishOnChain(text.trim());

      setStage("saving");
      await api.post("/notes/", {
        text: text.trim(),
        tx_hash: txHash,
        chain_id: import.meta.env.VITE_CHAIN_ID || "84532",
      });

      setStage("done");
      setText("");
      navigate(`/profile/${profile.id}`);
    } catch (err) {
      setStage("idle");
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setError("Transaction declined!");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || "Failed to save the note");
      }
    }
  }

  if (!token) {
    return (
      <div className="form-card">
        <h2>Add a note</h2>
        <p className="form-sub">
          To record a note, you must first connect your wallet (Connect Wallet button at the top of the page)
        </p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Add a note</h2>
      <p className="form-sub">
        What's your plan for your Base airdrop? Write a short sentence it will be registered on Base after being verified in MetaMask.
      </p>

      <div className="field">
        <label htmlFor="note-text">Note</label>
        <textarea
          id="note-text"
          rows={3}
          placeholder="If this airdrop is $50,000, I'll buy a new laptop."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
        />
        <div className={`char-count ${overLimit ? "over" : ""}`}>
          {text.length}/{MAX_LENGTH}
        </div>
      </div>

      <button className="btn btn-primary btn-full" type="submit" disabled={busy || !text.trim() || overLimit}>
        {busy && <span className="spinner" />}
        {stage === "signing" && "Confirming transaction..."}
        {stage === "saving" && "Saving..."}
        {stage === "idle" && "Recording notes on Base"}
      </button>

      {stage === "signing" && (
        <p className="status-line">Open your MetaMask window and confirm the transaction.</p>
      )}

      {error && <div className="error-box">{error}</div>}
    </form>
  );
}
