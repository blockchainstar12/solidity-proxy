# Multichain NFT Minting System (In Development)

This project demonstrates an NFT minting system using Hardhat for Ethereum, with planned support for cross-chain interactions using CosmWasm (under development). Currently, the project includes Ethereum smart contracts, tests, and deployment scripts.

## Prerequisites

- Node.js (v14+)
- npm
- Hardhat
- Alchemy API Key
- Sepolia Private Key

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```properties
ALCHEMY_API_KEY=[your Alchemy API key]
SEPOLIA_PRIVATE_KEY=[your Sepolia private key]
LOCAL_CONTRACT_ADDRESS=[your locally deployed contract address]
SEPOLIA_CONTRACT_ADDRESS=[your Sepolia deployed contract address]
```

## Running Locally

1. **Install Dependencies**
    ```bash
    npm install
    ```

2. **Start Local Hardhat Node**
    ```bash
    npx hardhat node
    ```

3. **Deploy Contract Locally**
    ```bash
    npx hardhat run --network localhost scripts/deploy.js
    ```

4. **Interact with Contract Locally**
    - Update `interact.js` with the local contract address
    - Run:
      ```bash
      npx hardhat run --network localhost scripts/interact.js
      ```

## Running on Sepolia

1. **Deploy Contract to Sepolia**
    - Update `hardhat.config.js` with your Alchemy API key and Sepolia private key
    - Run:
      ```bash
      npx hardhat run --network sepolia scripts/deploy.js
      ```

2. **Interact with Contract on Sepolia**
    Visit the Sepolia Etherscan page for your contract. In the "Write Contract" section, input:
    - tokenId: Your token ID (e.g., "12345") (ensure it's not minted before)
    - tokenURI: Your token URI (e.g., "https://example.com/metadata/12345")
    - extension (bytes): Encoded bytes string for additional data

3. **Check Logs**
    Use the [backend listener](https://github.com/blockchainstar12/backend-listener/) to monitor events.

Note: Cross-chain functionality with CosmWasm is under implementation.