// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTProxy is Ownable, ReentrancyGuard {
    // Events to log mint requests
    event MintRequest(
        address indexed requester,
        string tokenId,
        string chainType,
        string ownerAddress,
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

    event MetadataUpdateRequest(
        address indexed requester,
        string tokenId,
        string tokenURI
    );

    event ExtensionUpdateRequest(
        address indexed requester,
        string tokenId,
        bytes extension
    );

    // Mapping to track minted tokenIds
    mapping(string => bool) private mintedTokenIds;

    // Mapping to track token ownership
    mapping(string => address) private tokenOwners;

    // Constructor to initialize the Ownable contract
    constructor() Ownable(msg.sender) {}

    // Function to request minting of an NFT with additional ownership information
    function requestMint(
        string calldata tokenId,
        string calldata chainType,
        string calldata ownerAddress,
        string calldata tokenURI,
        bytes calldata extension
    ) external payable nonReentrant {
        require(!mintedTokenIds[tokenId], "Token ID already minted");
        require(bytes(chainType).length > 0, "Chain type cannot be empty");
        require(bytes(ownerAddress).length > 0, "Owner address cannot be empty");

        // Mark the tokenId as minted
        mintedTokenIds[tokenId] = true;
        
        // Only set the tokenOwners mapping if it's an Ethereum chain type
        if (keccak256(bytes(chainType)) == keccak256(bytes("ethereum"))) {
            tokenOwners[tokenId] = msg.sender;
        }
        
        // Updated event emission with chainType and ownerAddress
        emit MintRequest(
            msg.sender,
            tokenId,
            chainType,
            ownerAddress,
            tokenURI,
            extension
        );
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

    // Function to request setting metadata of an NFT
    function requestSetMetadata(
        string calldata tokenId,
        string calldata tokenURI
    ) external nonReentrant {
        require(tokenOwners[tokenId] == msg.sender, "Not token owner");
        
        emit MetadataUpdateRequest(msg.sender, tokenId, tokenURI);
    }

    // Function to request setting extension of an NFT
    function requestSetExtension(
        string calldata tokenId,
        bytes calldata extension
    ) external nonReentrant {
        require(tokenOwners[tokenId] == msg.sender, "Not token owner");
        
        emit ExtensionUpdateRequest(msg.sender, tokenId, extension);
    }

    // Public getter function for tokenOwners
    function getTokenOwner(string calldata tokenId) external view returns (address) {
        return tokenOwners[tokenId];
    }
}