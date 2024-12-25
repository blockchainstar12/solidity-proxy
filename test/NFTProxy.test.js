const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTProxy", function () {
  let NFTProxy;
  let nftProxy;
  let owner;
  let addr1;

  beforeEach(async function () {
    NFTProxy = await ethers.getContractFactory("NFTProxy");
    [owner, addr1] = await ethers.getSigners();
    nftProxy = await NFTProxy.deploy();
    await nftProxy.waitForDeployment(); // Wait for the deployment to be mined
  });

  it("should emit MintRequest event on requestMint", async function () {
    const tokenId = "1";
    const tokenURI = "https://example.com/token/1";
    const metadata = ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["metadata"]);
    const parseEther = ethers.parseEther || ethers.utils.parseEther; // Ensure compatibility with ethers v6

    await expect(nftProxy.connect(addr1).requestMint(tokenId, tokenURI, metadata, { value: parseEther("0.1") }))
      .to.emit(nftProxy, "MintRequest")
      .withArgs(addr1.address, tokenId, tokenURI, metadata);
  });
});