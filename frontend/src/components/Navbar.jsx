import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colorFromAddress, shortenAddress } from "../lib/format";

export default function Navbar() {
  const { profile, connect, connecting, logout, error } = useAuth();

  return (
    <>
      <header className="navbar">
        <Link className="brand" to="/">
          <span className="brand-dot" />
          Base Wishes
        </Link>

        <div className="nav-right">
          <Link className="nav-link" to="/add">
            Add a note
          </Link>

          {profile ? (
            <Link to={`/profile/${profile.id}`} className="account-chip">
              <span
                className="identicon"
                style={{
                  background: profile.avatar
                    ? `url(${profile.avatar})`
                    : colorFromAddress(profile.wallet_address),
                }}
              />
              <span className="address">{shortenAddress(profile.wallet_address)}</span>
            </Link>
          ) : (
            <button className="btn btn-primary" onClick={connect} disabled={connecting}>
              {connecting && <span className="spinner" />}
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}

          {profile && (
            <button className="btn btn-ghost" onClick={logout}>
              Disconnect
            </button>
          )}
        </div>
      </header>
      {error && !profile && (
        <div className="container" style={{ paddingTop: 12 }}>
          <div className="error-box">{error}</div>
        </div>
      )}
    </>
  );
}
