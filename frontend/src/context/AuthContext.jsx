import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, setAuthToken } from "../lib/api";
import { ensureBaseNetwork, hasWallet, requestAccount, signMessage } from "../lib/wallet";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("bw_token"));
  const [profile, setProfile] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("bw_token");
    setToken(null);
    setProfile(null);
    setAuthToken(null);
  }, []);

  // Whenever we have a token, load (or refresh) the profile behind it.
  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    api
      .get("/auth/me/")
      .then((res) => setProfile(res.data))
      .catch(() => logout());
  }, [token, logout]);

  // If the user switches accounts in MetaMask, the old session no longer applies.
  useEffect(() => {
    if (!hasWallet()) return;
    const onAccountsChanged = (accounts) => {
      if (profile && accounts[0]?.toLowerCase() !== profile.wallet_address) {
        logout();
      }
    };
    window.ethereum.on("accountsChanged", onAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", onAccountsChanged);
  }, [profile, logout]);

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      if (!hasWallet()) {
        throw new Error("MetaMask not found. Please install the MetaMask extension.");
      }
      const account = await requestAccount();
      await ensureBaseNetwork();

      const { data: nonceData } = await api.post("/auth/nonce/", {
        wallet_address: account,
      });
      const signature = await signMessage(account, nonceData.message);

      const { data: verifyData } = await api.post("/auth/verify/", {
        wallet_address: account,
        signature,
      });

      localStorage.setItem("bw_token", verifyData.access);
      setToken(verifyData.access);
      setProfile(verifyData.profile);
    } catch (err) {
      if (err.code === 4001) {
        setError("The request was rejected.");
      } else {
        setError(err.message || "Connection to wallet failed!");
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, profile, setProfile, connect, connecting, error, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
