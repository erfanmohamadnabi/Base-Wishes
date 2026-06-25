// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BaseWishes
/// @notice Lets anyone record a short public note ("if this airdrop is worth
///         $X, I will do Y") tied to their wallet address. Storage is kept
///         minimal (one struct per wish, capped text length) so the
///         transaction stays cheap on Base.
contract BaseWishes {
    struct Wish {
        address author;
        string text;
        uint256 timestamp;
    }

    uint256 public constant MAX_LENGTH = 280;

    Wish[] private wishes;

    // wallet => list of wish ids, handy for on-chain lookups without an indexer
    mapping(address => uint256[]) private wishesByAuthor;

    event WishAdded(
        uint256 indexed id,
        address indexed author,
        string text,
        uint256 timestamp
    );

    error EmptyWish();
    error WishTooLong();

    /// @notice Add a new wish for the caller.
    function addWish(string calldata text) external {
        uint256 len = bytes(text).length;
        if (len == 0) revert EmptyWish();
        if (len > MAX_LENGTH) revert WishTooLong();

        uint256 id = wishes.length;
        wishes.push(Wish({author: msg.sender, text: text, timestamp: block.timestamp}));
        wishesByAuthor[msg.sender].push(id);

        emit WishAdded(id, msg.sender, text, block.timestamp);
    }

    /// @notice Total number of wishes ever recorded.
    function totalWishes() external view returns (uint256) {
        return wishes.length;
    }

    /// @notice Fetch a single wish by id.
    function getWish(uint256 id) external view returns (address author, string memory text, uint256 timestamp) {
        Wish storage w = wishes[id];
        return (w.author, w.text, w.timestamp);
    }

    /// @notice All wish ids written by a given address.
    function getWishIdsByAuthor(address author) external view returns (uint256[] memory) {
        return wishesByAuthor[author];
    }
}
