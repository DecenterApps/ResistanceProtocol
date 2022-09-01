const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const delay = require("../utils/delay");
const { executeActionFromMSW } = require("../utils/multiSigAction");

describe("MarketTwapFeed", function () {
  let deployer;
  let snapshot;
  let MarketTwapFeedShortInterval, MarketTwapFeedLongInterval, LendingPoolMock;

  async function update(newPrice) {
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
    LendingPoolMock.setToken1("100000000000");

    EthPriceFeedMock = await ethers.getContract("EthPriceFeedMock", deployer);

    msw = await ethers.getContract("MultiSigWallet", deployer);

    RateSetterAddress = (await ethers.getContract("RateSetter", deployer))
      .address;

    EthTwapFeedShortInterval = await (
      await ethers.getContractFactory("EthTwapFeed")
    ).deploy(msw.address, 0, twapRefreshInterval, EthPriceFeedMock.address);
    await EthTwapFeedShortInterval.deployed();

    MarketTwapFeedShortInterval = await (
      await ethers.getContractFactory("MarketTwapFeed")
    ).deploy(
      0,
      twapRefreshInterval,
      LendingPoolMock.address,
      EthTwapFeedShortInterval.address,
      RateSetterAddress,
      EthPriceFeedMock.address,
      msw.address
    );
    await MarketTwapFeedShortInterval.deployed();

    MarketTwapFeedLongInterval = await (
      await ethers.getContractFactory("MarketTwapFeed")
    ).deploy(
      blockRefreshInterval,
      twapRefreshInterval,
      LendingPoolMock.address,
      EthTwapFeedShortInterval.address,
      RateSetterAddress,
      EthPriceFeedMock.address,
      msw.address
    );
    await MarketTwapFeedLongInterval.deployed();

    // add auths to MarketTwapFeeds in EthTwapFeed
    await executeActionFromMSW(
      msw,
      0,
      EthTwapFeedShortInterval.address,
      "setMarketTwapFeedContractAddress",
      ["address"],
      [MarketTwapFeedShortInterval.address]
    );
    await executeActionFromMSW(
      msw,
      0,
      EthTwapFeedShortInterval.address,
      "setMarketTwapFeedContractAddress",
      ["address"],
      [MarketTwapFeedLongInterval.address]
    );

    //add auth to MarketTwapFeeds for RateSetter Update
    await executeActionFromMSW(
      msw,
      0,
      RateSetterAddress,
      "setMarketTwapFeedContractAddress",
      ["address"],
      [MarketTwapFeedLongInterval.address]
    );
    await executeActionFromMSW(
      msw,
      0,
      RateSetterAddress,
      "setMarketTwapFeedContractAddress",
      ["address"],
      [MarketTwapFeedShortInterval.address]
    );
  });

  it("... try to update before time interval passed", async () => {
    await delay("2000");
    const updateTx = await MarketTwapFeedLongInterval.update();
    await updateTx.wait();

    await expect(MarketTwapFeedLongInterval.update()).to.be.reverted;
  });
  it("... dampen aggressive spikes (wale attacks)", async () => {
    await update("120000000");
    await update("130000000");
    await update("240000000");
    await update("110000000");
    await update("130000000");

    const twapUpper = (await MarketTwapFeedShortInterval.getTwap()).toString();

    expect(Number(twapUpper)).to.be.approximately(150000000, 20000000);
    await update("120000000");
    await update("40000000");
    await update("110000000");
    await update("120000000");

    const twapLower = (await MarketTwapFeedShortInterval.getTwap()).toString();

    expect(Number(twapLower)).to.be.approximately(100000000, 20000000);
  });
});
