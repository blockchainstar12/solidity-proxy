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

    // Constructor to initialize the Ownable contract with the deployer as the initial owner
    constructor() Ownable(msg.sender) {}

    // Function to request minting of an NFT
    function requestMint(
        string calldata tokenId,
        string calldata tokenURI,
        bytes calldata extension
    ) external payable nonReentrant {
        // Emit the MintRequest event
        emit MintRequest(msg.sender, tokenId, tokenURI, extension);
        
        // Additional logic can be added here
    }
}