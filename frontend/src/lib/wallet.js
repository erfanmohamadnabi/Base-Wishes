import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contract";

const BASE_SEPOLIA = {
  chainId: "0x14a34", // 84532
  chainName: "Base Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

const BASE_MAINNET = {
  chainId: "0x2105",
  chainName: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
};

const TARGET_NETWORK = BASE_MAINNET;

export function explorerTxUrl(txHash) {
  return `${TARGET_NETWORK.blockExplorerUrls[0]}/tx/${txHash}`;
}

export function hasWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function requestAccount() {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

// Asks MetaMask to switch to Base; if the chain isn't added yet, adds it first.
export async function ensureBaseNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: TARGET_NETWORK.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [TARGET_NETWORK],
      });
    } else {
      throw switchError;
    }
  }
}

export async function signMessage(address, message) {
  return window.ethereum.request({
    method: "personal_sign",
    params: [message, address],
  });
}

// Sends the addWish transaction and waits for it to be mined.
// Returns the transaction hash to store alongside the off-chain copy.
export async function submitWishOnChain(text) {
  if (!window.ethereum) throw new Error("No wallet found");

  // 1. FORCE network first
  await ensureBaseNetwork();

  // 2. double-check chain
  const chainId = await window.ethereum.request({ method: "eth_chainId" });

  if (chainId !== TARGET_NETWORK.chainId) {
    throw new Error("Please switch to Base network");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const tx = await contract.addWish(text);
  const receipt = await tx.wait();

  return receipt.hash;
}
