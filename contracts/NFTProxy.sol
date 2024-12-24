// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTProxy
 * @dev Proxy contract to bridge NFT operations between EVM and CosmWasm
 */
contract NFTProxy is Ownable, Pausable, ReentrancyGuard {
    // State variables
    mapping(address => uint256) public userDeposits;
    uint256 public mintFee; 
    
    // Events for backend tracking
    event NFTMintRequested(
        address indexed requester,
        string tokenId,
        string tokenUri,
        bytes metadata,
        uint256 timestamp,
        uint256 nonce
    );

    event FundsDeposited(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event FundsWithdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event MintFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );

    event ExtensionUpdated(
        address indexed updater,
        string tokenId,
        bytes newExtension,
        uint256 timestamp
    );

    event TokenURIUpdated(
        address indexed updater,
        string tokenId,
        string newTokenUri,
        uint256 timestamp
    );

    // Transaction nonce for unique identification
    uint256 private nonce;

    constructor(uint256 _mintFee) Ownable(msg.sender) {
        mintFee = _mintFee;
    }

    /**
     * @dev Request minting of an NFT
     * @param tokenId Unique identifier for the NFT
     * @param tokenUri URI containing NFT metadata
     * @param metadata Additional metadata for the NFT
     */
    function requestMint(
        string calldata tokenId,
        string calldata tokenUri,
        bytes calldata metadata
    ) external payable whenNotPaused nonReentrant {
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(bytes(tokenId).length > 0, "Token ID cannot be empty");
        require(bytes(tokenUri).length > 0, "Token URI cannot be empty");

        // Increment nonce for unique transaction ID
        nonce++;

        // Emit event for backend processing
        emit NFTMintRequested(
            msg.sender,
            tokenId,
            tokenUri,
            metadata,
            block.timestamp,
            nonce
        );

        // Handle excess payment
        uint256 excess = msg.value - mintFee;
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            require(success, "Failed to return excess payment");
        }
    }

    /**
     * @dev Deposit funds for future operations
     */
    function depositFunds() external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Must deposit some funds");
        
        userDeposits[msg.sender] += msg.value;

        emit FundsDeposited(
            msg.sender,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @dev Withdraw deposited funds
     * @param amount Amount to withdraw
     */
    function withdrawFunds(uint256 amount) external nonReentrant {
        require(userDeposits[msg.sender] >= amount, "Insufficient funds");
        
        userDeposits[msg.sender] -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(
            msg.sender,
            amount,
            block.timestamp
        );
    }

    /**
     * @dev Update mint fee (owner only)
     * @param newFee New mint fee amount
     */
    function updateMintFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = mintFee;
        mintFee = newFee;
        emit MintFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdrawContractBalance() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get user's deposited balance
     * @param user Address to check
     */
    function getDeposit(address user) external view returns (uint256) {
        return userDeposits[user];
    }

    /**
     * @dev Get current nonce
     */
    function getCurrentNonce() external view returns (uint256) {
        return nonce;
    }

    /**
     * @dev Update extension data
     * @param tokenId Unique identifier for the NFT
     * @param newExtension New extension data
     */
    function updateExtension(
        string calldata tokenId,
        bytes calldata newExtension
    ) external whenNotPaused nonReentrant {
        require(bytes(tokenId).length > 0, "Token ID cannot be empty");
        require(newExtension.length > 0, "Extension cannot be empty");
        
        // Emit event for backend processing
        emit ExtensionUpdated(
            msg.sender,
            tokenId, 
            newExtension,
            block.timestamp
        );
    }

    /**
     * @dev Update token URI
     * @param tokenId Unique identifier for the NFT
     * @param newTokenUri New token URI
     */
    function updateTokenURI(
        string calldata tokenId, 
        string calldata newTokenUri
    ) external whenNotPaused nonReentrant {
        require(bytes(tokenId).length > 0, "Token ID cannot be empty");
        require(bytes(newTokenUri).length > 0, "Token URI cannot be empty");
        
        // Emit event for backend processing
        emit TokenURIUpdated(
            msg.sender,
            tokenId,
            newTokenUri,
            block.timestamp
        );
    }

    // Allow contract to receive ETH
    receive() external payable {}
    fallback() external payable {}
}