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

    mapping(string => bool) private mintedTokenIds;

    // Constructor to initialize the Ownable contract with the deployer as the initial owner
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
        
        // Emit the MintRequest event
        emit MintRequest(msg.sender, tokenId, tokenURI, extension);
        
        // Additional logic can be added here
    }
}