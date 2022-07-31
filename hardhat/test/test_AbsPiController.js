const hre = require("hardhat");
const { assert, expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");

describe("AbsPiController", function () {
    const senderAccounts = [];
    let owner;
    let absPiController;
    let deployer;

    beforeEach(async () => {
        snapshot = await takeSnapshot();
    });

    afterEach(async () => {
        await revertToSnapshot(snapshot);
    });

    before(async () => {
        deployer = (await getNamedAccounts()).deployer;

        absPiController = await ethers.getContract("AbsPiController", deployer);

        owner = (await ethers.getSigners())[0];

        senderAccounts.push((await ethers.getSigners())[1]);
        senderAccounts.push((await ethers.getSigners())[2]);
        senderAccounts.push((await ethers.getSigners())[3]);
        senderAccounts.push((await ethers.getSigners())[4]);
    });

    it("... submit new tx from valid owner", async () => {});
});
