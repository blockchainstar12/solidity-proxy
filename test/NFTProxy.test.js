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
      const extension = ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["test metadata"]);

      await expect(nftProxy.connect(addr1).requestMint(tokenId, tokenURI, extension, {
        value: ethers.parseEther("0.1")
      }))
        .to.emit(nftProxy, "MintRequest")
        .withArgs(addr1.address, tokenId, tokenURI, extension);
    });

    it("should prevent minting with duplicate tokenId", async function () {
      const tokenId = "123456";
      const tokenURI = "https://example.com/metadata/123456";
      const extension = ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["test metadata"]);

      // First mint
      await nftProxy.connect(addr1).requestMint(tokenId, tokenURI, extension, {
        value: ethers.parseEther("0.1")
      });

      // Attempt duplicate mint
      await expect(
        nftProxy.connect(addr2).requestMint(tokenId, tokenURI, extension, {
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Token ID already minted");
    });

    it("should allow different users to mint different tokenIds", async function () {
      const extension = ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["test metadata"]);

      // First user mints
      await nftProxy.connect(addr1).requestMint("123", "https://example.com/123", extension, {
        value: ethers.parseEther("0.1")
      });

      // Second user mints
      await expect(
        nftProxy.connect(addr2).requestMint("456", "https://example.com/456", extension, {
          value: ethers.parseEther("0.1")
        })
      ).to.emit(nftProxy, "MintRequest");
    });
  });
});