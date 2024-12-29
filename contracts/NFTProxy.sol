// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTProxy is Ownable, ReentrancyGuard {
    // Events to log mint requests
    event MintRequest(
        address indexed requester,
        string tokenId,
        string tokenURI,
        bytes extension
    );

    event TransferRequest(
        address indexed from,
        address indexed to,
        string tokenId
    );

    event BurnRequest(
        address indexed requester,
        string tokenId
    );

    // Mapping to track minted tokenIds
    mapping(string => bool) private mintedTokenIds;

    // Mapping to track token ownership
    mapping(string => address) private tokenOwners;

    // Constructor to initialize the Ownable contract
    constructor() Ownable(msg.sender) {}

    // Function to request minting of an NFT
    function requestMint(
        string calldata tokenId,
        string calldata tokenURI,
        bytes calldata extension
    ) external payable nonReentrant {
        require(!mintedTokenIds[tokenId], "Token ID already minted");

        // Mark the tokenId as minted
        mintedTokenIds[tokenId] = true;
        tokenOwners[tokenId] = msg.sender;  // Track owner
        
        // Emit the MintRequest event
        emit MintRequest(msg.sender, tokenId, tokenURI, extension);
    }

    // Function to request transfer of an NFT
    function requestTransfer(
        address to,
        string calldata tokenId
    ) external nonReentrant {
        require(tokenOwners[tokenId] == msg.sender, "Not token owner");
        tokenOwners[tokenId] = to;  // Update owner
        
        emit TransferRequest(msg.sender, to, tokenId);
    }

    // Function to request burning of an NFT
    function requestBurn(
        string calldata tokenId
    ) external nonReentrant {
        require(tokenOwners[tokenId] == msg.sender, "Not token owner");
        delete tokenOwners[tokenId];
        
        emit BurnRequest(msg.sender, tokenId);
    }

    // Public getter function for tokenOwners
    function getTokenOwner(string calldata tokenId) external view returns (address) {
        return tokenOwners[tokenId];
    }
}