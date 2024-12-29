const hre = require("hardhat");

async function main() {
    try {
        const Contract_Address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
        const NFTProxy = await hre.ethers.getContractAt("NFTProxy", Contract_Address);

        const tokenId = "19115";
        const tokenURI = "https://example.com/metadata/1";
        const extension = hre.ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["test metadata"]);

        console.log("\nPreparing to mint NFT:");
        console.log("Token ID:", tokenId);
        console.log("Token URI:", tokenURI);
        console.log("Extension:", extension);

        const mintTx = await NFTProxy.requestMint(tokenId, tokenURI, extension, {
            value: hre.ethers.parseEther("0.1")
        });

        console.log("\nMint Transaction Details:");
        console.log("Hash:", mintTx.hash);
        console.log("To:", mintTx.to);
        console.log("From:", mintTx.from);
        console.log("\nWaiting for confirmation...");

        const mintReceipt = await mintTx.wait();
        console.log("\nMint Transaction confirmed in block:", mintReceipt.blockNumber);

        // Transfer the NFT
        const recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Replace with actual recipient address
        console.log("\nPreparing to transfer NFT:");
        console.log("Token ID:", tokenId);
        console.log("Recipient:", recipient);

        const transferTx = await NFTProxy.requestTransfer(recipient, tokenId);
        console.log("\nTransfer Transaction Details:");
        console.log("Hash:", transferTx.hash);
        console.log("To:", transferTx.to);
        console.log("From:", transferTx.from);
        console.log("\nWaiting for confirmation...");

        const transferReceipt = await transferTx.wait();
        console.log("\nTransfer Transaction confirmed in block:", transferReceipt.blockNumber);

        // Verify the new owner
        const newOwner = await NFTProxy.getTokenOwner(tokenId);
        console.log("\nNew Owner of Token ID", tokenId, ":", newOwner);

        // Burn the NFT
        console.log("\nPreparing to burn NFT:");
        console.log("Token ID:", tokenId);

        // Connect to the contract as the new owner
        const signer = await hre.ethers.getSigner(recipient);
        const NFTProxyWithSigner = NFTProxy.connect(signer);

        const burnTx = await NFTProxyWithSigner.requestBurn(tokenId);
        console.log("\nBurn Transaction Details:");
        console.log("Hash:", burnTx.hash);
        console.log("To:", burnTx.to);
        console.log("From:", burnTx.from);
        console.log("\nWaiting for confirmation...");

        const burnReceipt = await burnTx.wait();
        console.log("\nBurn Transaction confirmed in block:", burnReceipt.blockNumber);

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