const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
chai = require('chai');
const { assert, expect } = chai;
const BigNumber = require("big-number");

const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");

const {openAndMintFromCDP, repayToCDP} = require("../utils/positionActions");
const bigNumber = require("big-number");


describe("StabilityFee", function () {
    const senderAccounts = [];
    let owner;
    let noiContractObj;
    let CDPManagerContractObj;
    let TreasuryContractObj;
    let deployer;
    let snapshot;

    beforeEach(async () => {
        snapshot = await takeSnapshot();
    });

    afterEach(async () => {
        await revertToSnapshot(snapshot);
    });

    before(async () => {
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer;

        // go through all scripts from the deploy folder and run if it has the same tag
        //await deployments.fixture(["all"]);

        noiContractObj = await ethers.getContract("NOI", deployer);
        CDPManagerContractObj = await ethers.getContract("CDPManager", deployer);
        TreasuryContractObj = await ethers.getContract("Treasury", deployer);

        owner = (await ethers.getSigners())[0];

        senderAccounts.push((await ethers.getSigners())[1]);
        senderAccounts.push((await ethers.getSigners())[2]);
        senderAccounts.push((await ethers.getSigners())[3]);
        senderAccounts.push((await ethers.getSigners())[4]);
    });

    it("... pay debt with SF", async () => {


        let cdpIndex = await openAndMintFromCDP(CDPManagerContractObj,senderAccounts[1],"15",10000);
        
        await network.provider.send("evm_increaseTime", [31536000])
        await network.provider.send("evm_mine") 
        
        const totalDebt = await CDPManagerContractObj.connect(senderAccounts[1]).getDebtWithSF(cdpIndex);
        assert.equal(totalDebt.toString(), BigNumber(10).pow(18).mult(10000).mult(102).div(100).toString());
        
        let receipt = await repayToCDP(CDPManagerContractObj,noiContractObj,cdpIndex,senderAccounts[1],10000)
        
        const totalDebt2 = await CDPManagerContractObj.connect(senderAccounts[1]).getDebtWithSF(cdpIndex);
        assert.isTrue(BigNumber(totalDebt2.toString()).subtract(BigNumber(10).pow(18).mult(200)).lt(BigNumber(10).pow(15)));

    });

});
