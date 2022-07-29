const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const BigNumber = require('big-number');

describe("CDPManager", function () {
    const senderAccounts = [];
    let owner;
    let noiContractObj;
    let CDPManagerContractObj;
    let deployer;

    const wei = BigNumber(10).pow(18);

    before(async () => {
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer;

        // go through all scripts from the deploy folder and run if it has the same tag
        //await deployments.fixture(["all"]);

        // getContract gets the most recent deployment for the specified contract
        noiContractObj = await ethers.getContract("NOI", deployer);
        CDPManagerContractObj = await ethers.getContract("CDPManager", deployer);

        owner = (await ethers.getSigners())[0];

        senderAccounts.push((await ethers.getSigners())[1]);
        senderAccounts.push((await ethers.getSigners())[2]);
        senderAccounts.push((await ethers.getSigners())[3]);
        senderAccounts.push((await ethers.getSigners())[4]);
    });

    describe("Mint", function () {
        it("... mint tokens from valid user address", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("12"),
            });
            await txOpenCDP.wait();

            const value = BigNumber(10).pow(18).mult(9999).toString();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), value);
            await txmintFromCDPManager.wait();
            const balance = await noiContractObj.connect(senderAccounts[1]).balanceOf(senderAccounts[1].address);

            assert.equal(value, balance.toString());

            const txApprove = await noiContractObj.connect(senderAccounts[1]).approve(CDPManagerContractObj.address, value);
            await txApprove.wait();

            const txBurn = await CDPManagerContractObj.connect(senderAccounts[1]).repayToCDP(getCDPIndex.toString(), value);
            await txBurn.wait();
        });

        it("... mint more than we can handle", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("12"),
            });
            await txOpenCDP.wait();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            await expect(CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), BigNumber(10).pow(18).mult(10000).toString())).to.be.reverted;
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

            const mintValue = BigNumber(10).pow(18).mult(5000).toString();
            const approveValue = BigNumber(10).pow(18).mult(2000).toString();
            const leftValue = BigNumber(10).pow(18).mult(3000).toString();

            const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), mintValue);
            await txmintFromCDPManager.wait();

            const txApprove = await noiContractObj.connect(senderAccounts[1]).approve(CDPManagerContractObj.address, approveValue);
            await txApprove.wait();

            const txBurn = await CDPManagerContractObj.connect(senderAccounts[1]).repayToCDP(getCDPIndex.toString(), approveValue);
            await txBurn.wait();

            const txBalance = await noiContractObj.connect(senderAccounts[1]).balanceOf(senderAccounts[1].address);

            assert.equal(txBalance.toString(), leftValue);
        });

        it("... burn more than we can handle", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("12"),
            });
            await txOpenCDP.wait();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            const mintValue = BigNumber(10).pow(18).mult(5000).toString();
            const approveValue = BigNumber(10).pow(18).mult(2000).toString();

            const txMint = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), mintValue);
            await txMint.wait();

            const txApprove = await noiContractObj.connect(senderAccounts[1]).approve(CDPManagerContractObj.address, approveValue);
            await txApprove.wait();

            await expect(CDPManagerContractObj.connect(senderAccounts[1]).repayToCDP(getCDPIndex.toString(), mintValue)).to.be.reverted;
        });

        it("... burn tokens from invalid user address", async () => {
            const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {
                value: ethers.utils.parseEther("12"),
            });
            await txOpenCDP.wait();

            const mintValue = BigNumber(10).pow(18).mult(5000).toString();
            const repayValue = BigNumber(10).pow(18).mult(2000).toString();

            const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

            const txMint = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(getCDPIndex.toString(), mintValue);
            await txMint.wait();

            const txApprove = await noiContractObj.connect(senderAccounts[1]).approve(CDPManagerContractObj.address, mintValue);
            await txApprove.wait();

            await expect(CDPManagerContractObj.connect(senderAccounts[2]).repayToCDP(getCDPIndex.toString(), repayValue)).to.be.reverted;
        });
    });
});
