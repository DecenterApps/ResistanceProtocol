const hre = require("hardhat");
const { assert, expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");

describe("AbsPiController", function () {
    this.timeout(80000);

    const senderAccounts = [];
    let owner;
    let absPiController;
    let deployer;

    before(async () => {
        deployer = (await getNamedAccounts()).deployer;

        //await deployments.fixture(["all"]);

        AbsPiControllerContractObj = await ethers.getContract("AbsPiController", deployer);

        owner = (await hre.ethers.getSigners())[0];

        senderAccounts.push((await hre.ethers.getSigners())[1]);
        senderAccounts.push((await hre.ethers.getSigners())[2]);
        senderAccounts.push((await hre.ethers.getSigners())[3]);
        senderAccounts.push((await hre.ethers.getSigners())[4]);
    });

    it("... submit new tx from valid owner", async () => {
        
    });
});
