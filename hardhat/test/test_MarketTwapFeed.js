const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const delay = require("../utils/delay");

describe("MarketTwapFeed", function () {
    let deployer;
    let snapshot;
    let MarketTwapFeedShortInterval, MarketTwapFeedLongInterval, LendingPoolMock;

    async function update(delayTime, newPrice) {
        await delay(delayTime);

        const setNewPricetx = await LendingPoolMock.setToken2(newPrice);
        await setNewPricetx.wait();

        const updateTx = await MarketTwapFeedShortInterval.update();
        await updateTx.wait();
    }

    beforeEach(async () => {
        snapshot = await takeSnapshot();
    });

    afterEach(async () => {
        await revertToSnapshot(snapshot);
    });

    before(async () => {
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer;

        const blockRefreshInterval = 2;
        const twapRefreshInterval = 4;

        LendingPoolMock = await ethers.getContract("LendingPoolMock", deployer);
        LendingPoolMock.setToken1("100000000");

        MarketTwapFeedShortInterval = await (
            await ethers.getContractFactory("MarketTwapFeed")
        ).deploy(0, twapRefreshInterval, LendingPoolMock.address);
        await MarketTwapFeedShortInterval.deployed();

        MarketTwapFeedLongInterval = await (
            await ethers.getContractFactory("MarketTwapFeed")
        ).deploy(blockRefreshInterval, twapRefreshInterval, LendingPoolMock.address);
        await MarketTwapFeedLongInterval.deployed();
    });

    it("... try to update before time interval passed", async () => {
        await delay("2000");
        const updateTx = await MarketTwapFeedLongInterval.update();
        await updateTx.wait();

        await expect(MarketTwapFeedLongInterval.update()).to.be.reverted;
    });
    it("... dampen aggressive spikes (wale attacks)", async () => {
        await update(1000, "120000000");
        await update(1000, "130000000");
        await update(1000, "240000000");
        await update(1000, "110000000");
        await update(1000, "130000000");

        const twapUpper = (await MarketTwapFeedShortInterval.getTwap()).toString();

        expect(Number(twapUpper)).to.be.approximately(150000000, 20000000);
        await update(1000, "120000000");
        await update(1000, "40000000");
        await update(1000, "110000000");
        await update(1000, "120000000");

        const twapLower = (await MarketTwapFeedShortInterval.getTwap()).toString();

        expect(Number(twapLower)).to.be.approximately(100000000, 20000000);
    });
});
