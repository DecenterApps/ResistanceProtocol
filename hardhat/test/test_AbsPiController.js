const hre = require("hardhat");
const { assert, expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");

describe("AbsPiController", function () {
    this.timeout(80000);

    const senderAccounts = [];
    let owner;
    let absPiController;

    before(async () => {
        owner = (await hre.ethers.getSigners())[0];

        senderAccounts.push((await hre.ethers.getSigners())[1]);
        senderAccounts.push((await hre.ethers.getSigners())[2]);
        senderAccounts.push((await hre.ethers.getSigners())[3]);
        senderAccounts.push((await hre.ethers.getSigners())[4]);

        const absPiControllerContract = await hre.ethers.getContractFactory("AbsPiController");
        absPiController = await absPiControllerContract.deploy("-2","2","10","-10","200");
        await absPiController.deployed();
        console.log("Contract deployed to: ", absPiController.address);
    });

    it("... submit new tx from valid owner", async () => {
        
    });
});
