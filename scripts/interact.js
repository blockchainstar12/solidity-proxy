const hre = require("hardhat");

async function main() {
    const Contract_Address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const NFTProxy = await hre.ethers.getContractAt("NFTProxy", Contract_Address);

    const tokenId = "321";
    const tokenURI = "https://example.com/metadata/321";
    const extension = hre.ethers.toUtf8Bytes("test extension try 3");
    const event = await NFTProxy.requestMint(tokenId, tokenURI, extension);

    const tx = await NFTProxy.requestMint(tokenId, tokenURI, extension, {
        value: hre.ethers.parseEther("0.1")
    });

    console.log("Transaction sent: ", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction mined: ", receipt.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });