const hre = require("hardhat");

async function main() {
    const Contract_Address = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; // Contract address after deploying the contract
    const NFTProxy = await hre.ethers.getContractAt("NFTProxy", Contract_Address);

    const tokenId = "999";
    const tokenURI = "https://example.com/metadata/999";
    const extension = hre.ethers.toUtf8Bytes("test extension");
    const event = await NFTProxy.requestMint(tokenId, tokenURI, extension);

    const tx = await NFTProxy.requestMint(tokenId, tokenURI, extension, {
        value: hre.ethers.parseEther("0")
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