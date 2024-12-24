const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTProxy", function () {
    let nftProxy;
    let owner;
    let user1;
    let user2;
    const MINT_FEE = ethers.parseEther("0.1"); // 0.1 ETH
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        const NFTProxy = await ethers.getContractFactory("NFTProxy");
        nftProxy = await NFTProxy.deploy(MINT_FEE);
        await nftProxy.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await nftProxy.owner()).to.equal(owner.address);
        });

        it("Should set the correct mint fee", async function () {
            expect(await nftProxy.mintFee()).to.equal(MINT_FEE);
        });
    });

    describe("Minting", function () {
        const tokenId = "token1";
        const tokenUri = "ipfs://test";
        const metadata = ethers.encodeBytes32String("test-metadata");

        it("Should allow minting with correct fee", async function () {
            const tx = await nftProxy.connect(user1).requestMint(
                tokenId,
                tokenUri,
                metadata,
                { value: MINT_FEE }
            );

            await expect(tx)
                .to.emit(nftProxy, "NFTMintRequested")
                .withArgs(
                    user1.address,
                    tokenId,
                    tokenUri,
                    metadata,
                    await ethers.provider.getBlock(tx.blockNumber).then(b => b.timestamp),
                    1 // First nonce
                );
        });

        it("Should refund excess mint fee", async function () {
            const excessAmount = ethers.parseEther("0.2");
            const initialBalance = await ethers.provider.getBalance(user1.address);

            await nftProxy.connect(user1).requestMint(
                tokenId,
                tokenUri,
                metadata,
                { value: MINT_FEE + excessAmount }
            );

            const finalBalance = await ethers.provider.getBalance(user1.address);
            expect(finalBalance).to.be.closeTo(
                initialBalance - MINT_FEE,
                ethers.parseEther("0.01") // Allow for gas costs
            );
        });

        it("Should reject insufficient fee", async function () {
            await expect(
                nftProxy.connect(user1).requestMint(
                    tokenId,
                    tokenUri,
                    metadata,
                    { value: MINT_FEE - 1n }
                )
            ).to.be.revertedWith("Insufficient mint fee");
        });
    });

    describe("Funds Management", function () {
        const depositAmount = ethers.parseEther("1.0");

        it("Should allow deposits", async function () {
            await expect(
                nftProxy.connect(user1).depositFunds({ value: depositAmount })
            )
                .to.emit(nftProxy, "FundsDeposited")
                .withArgs(user1.address, depositAmount, await time());

            expect(await nftProxy.getDeposit(user1.address)).to.equal(depositAmount);
        });

        it("Should allow withdrawals", async function () {
            await nftProxy.connect(user1).depositFunds({ value: depositAmount });

            await expect(
                nftProxy.connect(user1).withdrawFunds(depositAmount)
            )
                .to.emit(nftProxy, "FundsWithdrawn")
                .withArgs(user1.address, depositAmount, await time());

            expect(await nftProxy.getDeposit(user1.address)).to.equal(0);
        });

        it("Should prevent withdrawing more than deposited", async function () {
            await expect(
                nftProxy.connect(user1).withdrawFunds(depositAmount)
            ).to.be.revertedWith("Insufficient funds");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to update mint fee", async function () {
            const newFee = ethers.parseEther("0.2");
            
            await expect(nftProxy.connect(owner).updateMintFee(newFee))
                .to.emit(nftProxy, "MintFeeUpdated")
                .withArgs(MINT_FEE, newFee);

            expect(await nftProxy.mintFee()).to.equal(newFee);
        });

        it("Should prevent non-owner from updating mint fee", async function () {
            await expect(
                nftProxy.connect(user1).updateMintFee(ethers.parseEther("0.2"))
            ).to.be.revertedWithCustomError(nftProxy, "OwnableUnauthorizedAccount");
        });

        it("Should allow owner to withdraw contract balance", async function () {
            // First deposit some funds
            await nftProxy.connect(user1).requestMint(
                "token1",
                "ipfs://test",
                ethers.encodeBytes32String("test-metadata"),
                { value: MINT_FEE }
            );

            const initialBalance = await ethers.provider.getBalance(owner.address);
            await nftProxy.connect(owner).withdrawContractBalance();
            const finalBalance = await ethers.provider.getBalance(owner.address);

            expect(finalBalance).to.be.gt(initialBalance);
        });
    });

    describe("Pause Functionality", function () {
        it("Should allow owner to pause and unpause", async function () {
            await nftProxy.connect(owner).pause();
            
            await expect(
                nftProxy.connect(user1).requestMint(
                    "token1",
                    "ipfs://test",
                    ethers.encodeBytes32String("test-metadata"),
                    { value: MINT_FEE }
                )
            ).to.be.revertedWith("Pausable: paused");

            await nftProxy.connect(owner).unpause();

            await expect(
                nftProxy.connect(user1).requestMint(
                    "token1",
                    "ipfs://test",
                    ethers.encodeBytes32String("test-metadata"),
                    { value: MINT_FEE }
                )
            ).to.not.be.reverted;
        });
    });

    describe("Metadata Updates", function () {
        const tokenId = "token1";
        
        it("Should allow extension updates", async function () {
            const newExtension = ethers.encodeBytes32String("new-extension");
            
            await expect(nftProxy.connect(user1).updateExtension(tokenId, newExtension))
                .to.emit(nftProxy, "ExtensionUpdated")
                .withArgs(user1.address, tokenId, newExtension, await time());
        });

        it("Should allow tokenURI updates", async function () {
            const newTokenUri = "ipfs://new-uri";
            
            await expect(nftProxy.connect(user1).updateTokenURI(tokenId, newTokenUri))
                .to.emit(nftProxy, "TokenURIUpdated")
                .withArgs(user1.address, tokenId, newTokenUri, await time());
        });
    });

    describe("Nonce Management", function () {
        it("Should increment nonce correctly", async function () {
            expect(await nftProxy.getCurrentNonce()).to.equal(0);

            await nftProxy.connect(user1).requestMint(
                "token1",
                "ipfs://test",
                ethers.encodeBytes32String("test-metadata"),
                { value: MINT_FEE }
            );

            expect(await nftProxy.getCurrentNonce()).to.equal(1);
        });
    });
});

// Helper function to get current timestamp
async function time() {
    return await ethers.provider.getBlock("latest").then(b => b.timestamp);
}