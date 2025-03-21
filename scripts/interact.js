const hre = require("hardhat");

async function main() {
    try {
        const Contract_Address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const NFTProxy = await hre.ethers.getContractAt("NFTProxy", Contract_Address);

        const tokenId = "1709"; // Using a new token ID
        const chainType = "ethereum";
        const ownerAddress = "0x0729a81A995Bed60F4F6C5Ec960bEd999740e160"; 
        const tokenURI = "https://example.com/metadata/1";
        
        // Create a properly structured metadata object that matches your contract's expectations
        const metadata = {
            name: "Cross-Chain NFT",
            description: "Test NFT bridged from Ethereum to Nibiru",
            image: "https://example.com/image.png",
            attributes: [
                {
                    trait_type: "Source Chain",
                    value: "Ethereum"
                }
            ]
        };
        
        // Encode the metadata as bytes
        const extension = hre.ethers.AbiCoder.defaultAbiCoder().encode(
            ["string"], 
            [JSON.stringify(metadata)]
        );

        console.log("\nPreparing to mint NFT:");
        console.log("Token ID:", tokenId);
        console.log("Chain Type:", chainType);
        console.log("Owner Address:", ownerAddress);
        console.log("Token URI:", tokenURI);
        console.log("Extension (Metadata):", JSON.stringify(metadata, null, 2));

        const mintTx = await NFTProxy.requestMint(
            tokenId,
            chainType,
            ownerAddress,
            tokenURI,
            extension,
            { value: hre.ethers.parseEther("0.1") }
        );

        console.log("\nMint Transaction Details:");
        console.log("Hash:", mintTx.hash);
        console.log("To:", mintTx.to);
        console.log("From:", mintTx.from);
        console.log("\nWaiting for confirmation...");

        const mintReceipt = await mintTx.wait();
        console.log("\nMint Transaction confirmed in block:", mintReceipt.blockNumber);

    } catch (error) {
        console.error("\nError:", error.message);
        if (error.data) {
            console.error("Error data:", error.data);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });