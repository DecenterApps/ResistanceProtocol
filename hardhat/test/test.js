const hre = require("hardhat");
const { assert, expect } = require("chai");

describe("CDPManager", function () {
    this.timeout(80000);

    const senderAccounts = [];
    let owner;
    let noiContractObj;
    let CDPManagerContractObj;

    before(async () => {
        const NoiContract = await hre.ethers.getContractFactory("NOI");
        noiContractObj = await NoiContract.deploy("NOI", "NOI", 42);
        await noiContractObj.deployed();
        console.log("Contract deployed to: ", noiContractObj.address);

        const CDPManagerContract = await hre.ethers.getContractFactory("CDPManager");
        CDPManagerContractObj = await CDPManagerContract.deploy(noiContractObj.address);
        await CDPManagerContractObj.deployed();

        owner = (await hre.ethers.getSigners())[0];

        // add auth to cdpManager to mint and burn tokens from erc20
        const txAddAuthToCDPManager = await noiContractObj.connect(owner).addAuthorization(CDPManagerContractObj.address);
        await txAddAuthToCDPManager.wait();

        senderAccounts.push((await hre.ethers.getSigners())[1]);
        senderAccounts.push((await hre.ethers.getSigners())[2]);
        senderAccounts.push((await hre.ethers.getSigners())[3]);
        senderAccounts.push((await hre.ethers.getSigners())[4]);
    });

    describe("Mint", function () {
        it("... mint tokens from valid user address", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("12"),
            });
            await txOpenCDP.wait();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), "9999");
            await txmintFromCDPManager.wait();
            const balance = await noiContractObj.connect(senderAccounts[1]).balanceOf(senderAccounts[1].address);

            assert.equal("9999", balance.toString());

            const txApprove = await noiContractObj.connect(senderAccounts[1]).approve(CDPManagerContractObj.address, "9999");
            await txApprove.wait();

            const txBurn = await CDPManagerContractObj.connect(senderAccounts[1]).repayToCDP(getCDPIndex.toString(), "9999");
            await txBurn.wait();
        });

        it("... mint more than we can handle", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("12"),
            });
            await txOpenCDP.wait();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            await expect(CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), "10000")).to.be.reverted;
        });

        it("... mint tokens from invalid user address", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("10"),
            });
            await txOpenCDP.wait();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            await expect(CDPManagerContractObj.connect(senderAccounts[2]).mintFromCDP(getCDPIndex.toString(), "10")).to.be.reverted;
        });
    });

    describe("Burn", function () {
        it("... burn tokens from valid user address", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("12"),
            });
            await txOpenCDP.wait();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), "5000");
            await txmintFromCDPManager.wait();

            const txApprove = await noiContractObj.connect(senderAccounts[1]).approve(CDPManagerContractObj.address, "2000");
            await txApprove.wait();

            const txBurn = await CDPManagerContractObj.connect(senderAccounts[1]).repayToCDP(getCDPIndex.toString(), "2000");
            await txBurn.wait();

            const txBalance = await noiContractObj.connect(senderAccounts[1]).balanceOf(senderAccounts[1].address);

            assert.equal(txBalance.toString(), "3000");
        });

        it("... burn more than we can handle", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("12"),
            });
            await txOpenCDP.wait();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            const txMint = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), "5000");
            await txMint.wait();

            const txApprove = await noiContractObj.connect(senderAccounts[1]).approve(CDPManagerContractObj.address, "4000");
            await txApprove.wait();

            await expect(CDPManagerContractObj.connect(senderAccounts[1]).repayToCDP(getCDPIndex.toString(), "5000")).to.be.reverted;
        });

        it("... burn tokens from invalid user address", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("12"),
            });
            await txOpenCDP.wait();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            const txMint = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), "5000");
            await txMint.wait();

            const txApprove = await noiContractObj.connect(senderAccounts[1]).approve(CDPManagerContractObj.address, "5000");
            await txApprove.wait();

            await expect(CDPManagerContractObj.connect(senderAccounts[2]).repayToCDP(getCDPIndex.toString(), "2000")).to.be.reverted;
        });
    });
});
