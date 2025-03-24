const hre = require("hardhat");

// Configuration
const CONFIG = {
  contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  defaultFee: "0.1", // ETH
  operation: "transfer", // Options: "mint", "burn", "transfer"
};

// Main execution function
async function main() {
  try {
    // Connect to contract
    const NFTProxy = await connectToContract(CONFIG.contractAddress);
    
    // Execute selected operation
    switch (CONFIG.operation) {
      case "mint":
        await mintNFT(NFTProxy);
        break;
      case "burn":
        await burnNFT(NFTProxy);
        break;
      case "transfer":
        await transferNFT(NFTProxy);
        break;
      default:
        console.log(`Operation '${CONFIG.operation}' not supported. Please choose from: mint, burn, transfer`);
    }
  } catch (error) {
    handleError(error);
  }
}

// Connect to the NFTProxy contract
async function connectToContract(address) {
  console.log(`\nConnecting to NFTProxy contract at: ${address}`);
  return await hre.ethers.getContractAt("NFTProxy", address);
}

// Mint NFT function
async function mintNFT(NFTProxy) {
  // Mint parameters
  const params = {
    tokenId: "105",
    chainType: "ethereum",
    ownerAddress: "0x0729a81A995Bed60F4F6C5Ec960bEd999740e160",
    tokenURI: "https://example.com/metadata/1",
    metadata: {
      name: "Cross-Chain NFT",
      description: "Test NFT bridged from Ethereum to Nibiru",
      image: "https://example.com/image.png",
      attributes: [
        {
          trait_type: "Source Chain",
          value: "Ethereum"
        }
      ]
    }
  };

  // Encode metadata as bytes
  const extension = hre.ethers.AbiCoder.defaultAbiCoder().encode(
    ["string"],
    [JSON.stringify(params.metadata)]
  );

  // Log mint parameters
  console.log("\n=== MINT NFT ===");
  console.log("Token ID:", params.tokenId);
  console.log("Chain Type:", params.chainType);
  console.log("Owner Address:", params.ownerAddress);
  console.log("Token URI:", params.tokenURI);
  console.log("Extension (Metadata):", JSON.stringify(params.metadata, null, 2));

  // Send mint transaction
  console.log("\nSending mint transaction...");
  const mintTx = await NFTProxy.requestMint(
    params.tokenId,
    params.chainType,
    params.ownerAddress,
    params.tokenURI,
    extension,
    { value: hre.ethers.parseEther(CONFIG.defaultFee) }
  );

  // Log transaction details
  logTransactionDetails(mintTx, "Mint");

  // Wait for confirmation
  const mintReceipt = await mintTx.wait();
  console.log(`\nMint Transaction confirmed in block: ${mintReceipt.blockNumber}`);

  // Log events
  logEvents(mintReceipt, "MintRequest");
}

// Burn NFT function
async function burnNFT(NFTProxy) {
  // Burn parameters
  const params = {
    tokenId: "99",
  };

  // Verify token ownership
  await verifyTokenOwnership(NFTProxy, params.tokenId);

  // Log burn parameters
  console.log("\n=== BURN NFT ===");
  console.log("Token ID:", params.tokenId);

  // Send burn transaction
  console.log("\nSending burn transaction...");
  const burnTx = await NFTProxy.requestBurn(params.tokenId);

  // Log transaction details
  logTransactionDetails(burnTx, "Burn");

  // Wait for confirmation
  const burnReceipt = await burnTx.wait();
  console.log(`\nBurn Transaction confirmed in block: ${burnReceipt.blockNumber}`);

  // Log events
  logEvents(burnReceipt, "BurnRequest");
}

async function transferNFT(NFTProxy) {
  // Transfer parameters
  const params = {
    tokenId: "105",
    recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // Example recipient address
  };

  // Verify token ownership before transfer
  await verifyTokenOwnership(NFTProxy, params.tokenId);

  // Log transfer parameters
  console.log("\n=== TRANSFER NFT ===");
  console.log("Token ID:", params.tokenId);
  console.log("Recipient:", params.recipient);

  // Send transfer transaction
  console.log("\nSending transfer transaction...");
  const transferTx = await NFTProxy.requestTransfer(params.recipient, params.tokenId);

  // Log transaction details
  logTransactionDetails(transferTx, "Transfer");

  // Wait for confirmation
  const transferReceipt = await transferTx.wait();
  console.log(`\nTransfer Transaction confirmed in block: ${transferReceipt.blockNumber}`);

  // Log events
  logEvents(transferReceipt, "TransferRequest");

  // Verify new ownership
  try {
    const newOwner = await NFTProxy.getTokenOwner(params.tokenId);
    console.log("\nOwnership after transfer:");
    console.log("Token ID:", params.tokenId);
    console.log("New owner:", newOwner);
    
    if (newOwner.toLowerCase() === params.recipient.toLowerCase()) {
      console.log("\n✅ Transfer successful - Ownership verified");
    } else {
      console.log("\n⚠️ Unexpected owner after transfer");
      console.log(`Expected: ${params.recipient}`);
      console.log(`Actual: ${newOwner}`);
    }
  } catch (error) {
    console.log("\n⚠️ Could not verify new ownership:", error.message);
  }
}

// Helper function to verify token ownership
async function verifyTokenOwnership(NFTProxy, tokenId) {
  try {
    const currentOwner = await NFTProxy.getTokenOwner(tokenId);
    const [signer] = await hre.ethers.getSigners();
    const signerAddress = await signer.getAddress();
    
    console.log("\nOwnership Check:");
    console.log("Token ID:", tokenId);
    console.log("Current owner:", currentOwner);
    console.log("Your address:", signerAddress);
    
    if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
      console.log("\n⚠️ WARNING: You are not the current owner of this token!");
      console.log("Transaction may fail if the contract requires ownership.");
    } else {
      console.log("\n✅ You are the current owner of this token");
    }
  } catch (error) {
    console.log("\n⚠️ Could not verify token ownership:", error.message);
  }
}

// Helper function to log transaction details
function logTransactionDetails(tx, operationName) {
  console.log(`\n${operationName} Transaction Details:`);
  console.log("Hash:", tx.hash);
  console.log("To:", tx.to);
  console.log("From:", tx.from);
  console.log("\nWaiting for confirmation...");
}

// Helper function to log events
function logEvents(receipt, eventName) {
  const events = receipt.logs.filter(
    log => log?.fragment?.name === eventName
  );
  
  if (events.length > 0) {
    console.log(`\n${eventName} event found:`);
    events.forEach((event, index) => {
      try {
        console.log(`\nEvent #${index + 1}:`);
        Object.entries(event.args).forEach(([key, value]) => {
          // Skip numeric keys
          if (isNaN(parseInt(key))) {
            console.log(`- ${key}: ${value}`);
          }
        });
      } catch (err) {
        console.log(`Could not decode event #${index + 1}: ${err.message}`);
      }
    });
  } else {
    console.log(`\nNo ${eventName} events found in transaction logs`);
  }
}

// Helper function for error handling
function handleError(error) {
  console.error("\nError occurred:");
  console.error(error.message);
  
  if (error.data) {
    console.error("Error data:", error.data);
  }
  
  if (error.reason) {
    console.error("Reason:", error.reason);
  }
  
  process.exit(1);
}

// Execute main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });