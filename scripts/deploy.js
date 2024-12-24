const hre = require("hardhat");

async function main() {
  // Initial mint fee (0.1 ETH)
  const MINT_FEE = hre.ethers.parseEther("0.1");

  console.log("Deploying NFTProxy contract...");
  
  const NFTProxy = await hre.ethers.getContractFactory("NFTProxy");
  const nftProxy = await NFTProxy.deploy(MINT_FEE);
  
  await nftProxy.waitForDeployment();
  const address = await nftProxy.getAddress();

  console.log(`NFTProxy deployed to: ${address}`);
  console.log(`Initial mint fee set to: ${MINT_FEE} wei`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});