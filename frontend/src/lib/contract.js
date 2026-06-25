export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Minimal human-readable ABI matching contract/BaseWishes.sol
export const CONTRACT_ABI = [
  "function addWish(string text) external",
  "function totalWishes() external view returns (uint256)",
  "function getWish(uint256 id) external view returns (address author, string text, uint256 timestamp)",
  "function getWishIdsByAuthor(address author) external view returns (uint256[])",
  "event WishAdded(uint256 indexed id, address indexed author, string text, uint256 timestamp)",
];
