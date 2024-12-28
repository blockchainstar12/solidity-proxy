const hre = require("hardhat");

async function main() {
    try {
        const Contract_Address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const NFTProxy = await hre.ethers.getContractAt("NFTProxy", Contract_Address);

        const tokenId = "18021";
        const tokenURI = "https://example.com/metadata/1";
        const extension = hre.ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["test metadata"]);

        console.log("\nPreparing to mint NFT:");
        console.log("Token ID:", tokenId);
        console.log("Token URI:", tokenURI);
        console.log("Extension:", extension);

        const tx = await NFTProxy.requestMint(tokenId, tokenURI, extension, {
            value: hre.ethers.parseEther("0.1")
        });

        console.log("\nTransaction Details:");
        console.log("Hash:", tx.hash);
        console.log("To:", tx.to);
        console.log("From:", tx.from);
        console.log("\nWaiting for confirmation...");

        const receipt = await tx.wait();
        console.log("\nTransaction confirmed in block:", receipt.blockNumber);
    } catch (error) {
        console.error("\nError:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });