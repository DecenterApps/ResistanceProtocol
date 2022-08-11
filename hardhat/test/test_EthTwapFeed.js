const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const delay = require("../utils/delay");

describe("EthTwapFeed", function () {
    const senderAccounts = [];
    let deployer;
    let snapshot;
    let EthTwapFeedShortInterval, EthTwapFeedLongInterval, EthPriceFeedMock;

    async function update(newPrice) {

        const setNewPricetx = await EthPriceFeedMock.setPrice(newPrice);
        await setNewPricetx.wait();

        const updateTx = await EthTwapFeedShortInterval.update();
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

        EthPriceFeedMock = await ethers.getContract("EthPriceFeedMock", deployer);

        EthTwapFeedShortInterval = await (
            await ethers.getContractFactory("EthTwapFeed")
        ).deploy(0, twapRefreshInterval, EthPriceFeedMock.address);
        await EthTwapFeedShortInterval.deployed();

        EthTwapFeedLongInterval = await (
            await ethers.getContractFactory("EthTwapFeed")
        ).deploy(blockRefreshInterval, twapRefreshInterval, EthPriceFeedMock.address);
        await EthTwapFeedLongInterval.deployed();

        senderAccounts.push((await ethers.getSigners())[1]);
        senderAccounts.push((await ethers.getSigners())[2]);
        senderAccounts.push((await ethers.getSigners())[3]);
        senderAccounts.push((await ethers.getSigners())[4]);
    });

    it("... check if price feed is fetched from eth price feed", async () => {
        const ethPriceFeed = await EthPriceFeedMock.price();
        const ethPriceFeedTwap = await EthTwapFeedShortInterval.getEthPrice();
        assert.equal(ethPriceFeed.toString(), ethPriceFeedTwap.toString());
    });
    it("... try to update before time interval passed", async () => {
        await delay("2000");
        const updateTx = await EthTwapFeedLongInterval.update();
        await updateTx.wait();

        await expect(EthTwapFeedLongInterval.update()).to.be.reverted;
    });
    it("... dampen aggressive spikes (wale attacks)", async () => {
        await update("120000000000");
        await update("130000000000");
        await update("240000000000");
        await update("110000000000");
        await update("130000000000");

        const twapUpper = (await EthTwapFeedShortInterval.ethTwapPrice()).toString();

        expect(Number(twapUpper)).to.be.approximately(150000000000, 20000000000);
        await update("120000000000");
        await update("40000000000");
        await update("110000000000");
        await update("120000000000");

        const twapLower = (await EthTwapFeedShortInterval.ethTwapPrice()).toString();

        expect(Number(twapLower)).to.be.approximately(100000000000, 20000000000);
    });
});
