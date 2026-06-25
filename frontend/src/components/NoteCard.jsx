import { Link } from "react-router-dom";
import { colorFromAddress, shortenAddress, timeAgo } from "../lib/format";
import { explorerTxUrl } from "../lib/wallet";

export default function NoteCard({ note }) {
  const { author } = note;
  const displayName = author.display_name || shortenAddress(author.wallet_address);

  return (
    <article className="note-card">
      <div className="note-author-row">
        <Link to={`/profile/${author.wallet_address}`}>
          <span
            className="identicon"
            style={{
              background: author.avatar
                ? `url(${author.avatar})`
                : colorFromAddress(author.wallet_address),
            }}
          />
        </Link>
        <div>
          <Link to={`/profile/${author.id}`} className="note-author-name">
            {displayName}
          </Link>
        </div>
        <span className="note-time">{timeAgo(note.created_at)}</span>
      </div>

      <p className="note-text">{note.text}</p>

      <div className="note-footer">
        <a
          className="tx-link"
          href={explorerTxUrl(note.tx_hash)}
          target="_blank"
          rel="noreferrer"
        >
          recorded on-chain ↗
        </a>
      </div>
    </article>
  );
}
