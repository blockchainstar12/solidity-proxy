const hre = require("hardhat");

async function main() {
  try {
    // Get the contract factory
    const NFTProxy = await hre.ethers.getContractFactory("NFTProxy");
    
    // Deploy the contract
    const nftProxy = await NFTProxy.deploy();
    
    // Wait for deployment to complete
    await nftProxy.waitForDeployment();
    
    // Get the deployed contract address
    const deployedAddress = await nftProxy.getAddress();
    
    console.log("NFTProxy deployed to:", deployedAddress);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });