const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTProxy", function () {
  let NFTProxy;
  let nftProxy;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Deploy a new NFTProxy contract before each test
    NFTProxy = await ethers.getContractFactory("NFTProxy");
    [owner, addr1, addr2] = await ethers.getSigners();
    nftProxy = await NFTProxy.deploy();
    await nftProxy.waitForDeployment();
  });

  describe("Minting", function () {
    it("should allow first-time minting with valid tokenId", async function () {
      const tokenId = "123456";
      const tokenURI = "https://example.com/metadata/123456";
      const extension = "0x";

      await expect(nftProxy.connect(addr1).requestMint(tokenId, tokenURI, extension))
        .to.emit(nftProxy, "MintRequest")
        .withArgs(addr1.address, tokenId, tokenURI, extension);

      expect(await nftProxy.getTokenOwner(tokenId)).to.equal(addr1.address);
    });

    it("should not allow minting with an already minted tokenId", async function () {
      const tokenId = "123456";
      const tokenURI = "https://example.com/metadata/123456";
      const extension = "0x";

      await nftProxy.connect(addr1).requestMint(tokenId, tokenURI, extension);

      await expect(nftProxy.connect(addr1).requestMint(tokenId, tokenURI, extension))
        .to.be.revertedWith("Token ID already minted");
    });
  });

  describe("Transferring", function () {
    it("should allow the owner to transfer the token", async function () {
      const tokenId = "123456";
      const tokenURI = "https://example.com/metadata/123456";
      const extension = "0x";

      await nftProxy.connect(addr1).requestMint(tokenId, tokenURI, extension);

      await expect(nftProxy.connect(addr1).requestTransfer(addr2.address, tokenId))
        .to.emit(nftProxy, "TransferRequest")
        .withArgs(addr1.address, addr2.address, tokenId);

      expect(await nftProxy.getTokenOwner(tokenId)).to.equal(addr2.address);
    });

    it("should not allow a non-owner to transfer the token", async function () {
      const tokenId = "123456";
      const tokenURI = "https://example.com/metadata/123456";
      const extension = "0x";

      await nftProxy.connect(addr1).requestMint(tokenId, tokenURI, extension);

      await expect(nftProxy.connect(addr2).requestTransfer(addr2.address, tokenId))
        .to.be.revertedWith("Not token owner");
    });
  });

  describe("Burning", function () {
    it("should allow the owner to burn the token", async function () {
      const tokenId = "123456";
      const tokenURI = "https://example.com/metadata/123456";
      const extension = "0x";

      await nftProxy.connect(addr1).requestMint(tokenId, tokenURI, extension);

      await expect(nftProxy.connect(addr1).requestBurn(tokenId))
        .to.emit(nftProxy, "BurnRequest")
        .withArgs(addr1.address, tokenId);

      expect(await nftProxy.getTokenOwner(tokenId)).to.equal(ethers.ZeroAddress);
    });

    it("should not allow a non-owner to burn the token", async function () {
      const tokenId = "123456";
      const tokenURI = "https://example.com/metadata/123456";
      const extension = "0x";

      await nftProxy.connect(addr1).requestMint(tokenId, tokenURI, extension);

      await expect(nftProxy.connect(addr2).requestBurn(tokenId))
        .to.be.revertedWith("Not token owner");
    });
  });
});