const hre = require("hardhat");
const { assert, expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const { ethers } = require("hardhat");
const { executeActionFromMSW } = require("../utils/multiSigAction");

describe("ShutdownModule", function () {
  const senderAccounts = [];
  let owner;
  let CDPManagerContractObj;
  let deployer;
  let ShutdownModuleObj;
  let ParametersContractObj;
  let NOIContract;
  let TreasuryContract;
  let msw;
  let LiquidatorObj;
  let RateSetterObj;
  let MarketTwapObj;
  let EthTwapObj;

  beforeEach(async () => {
    snapshot = await takeSnapshot();
  });

  afterEach(async () => {
    await revertToSnapshot(snapshot);
  });

  before(async () => {
    deployer = (await getNamedAccounts()).deployer;

    ShutdownModuleObj = await ethers.getContract("ShutdownModule", deployer);
    ParametersContractObj = await ethers.getContract("Parameters", deployer);
    CDPManagerContractObj = await ethers.getContract("CDPManager", deployer);
    NOIContract = await ethers.getContract("NOI", deployer);
    TreasuryContract = await ethers.getContract("Treasury", deployer);
    msw = await ethers.getContract("MultiSigWallet", deployer);
    LiquidatorObj = await ethers.getContract("Liquidator", deployer);
    RateSetterObj = await ethers.getContract("RateSetter", deployer);
    MarketTwapObj = await ethers.getContract("MarketTwapFeed", deployer);
    EthTwapObj = await ethers.getContract("EthTwapFeed", deployer);

    senderAccounts.push((await hre.ethers.getSigners())[1]);
    senderAccounts.push((await hre.ethers.getSigners())[2]);
    senderAccounts.push((await hre.ethers.getSigners())[3]);
    senderAccounts.push((await hre.ethers.getSigners())[4]);
  });

  it("... calculate global CR", async () => {
    let txGlobalCR = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).calculateGlobalCR();
  });

  it("... global CR should change", async () => {
    let oldGlobalCR = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).calculateGlobalCR();
    const txOpen = await CDPManagerContractObj.connect(
      senderAccounts[0]
    ).openCDPandMint(senderAccounts[0].address, 1000, {
      value: ethers.utils.parseEther("2"),
    });
    let newGlobalCR = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).calculateGlobalCR();
    assert.notEqual(oldGlobalCR, newGlobalCR);
  });

  it("... start shutdown false", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();
    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("false", shutdown.toString());
  });

  it("... start shutdown true", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();
    const txParam = await ParametersContractObj.connect(
      senderAccounts[0]
    ).setGlobalCRLimit(1100);

    await executeActionFromMSW(
      msw,
      0,
      ShutdownModuleObj.address,
      "modifyParameters",
      ["bytes32", "uint256"],
      [ethers.utils.formatBytes32String("timeForPhaseOne"), "10"]
    );

    const amount = "1000000000000000000000";

    const txOpen = await CDPManagerContractObj.connect(
      senderAccounts[0]
    ).openCDPandMint(senderAccounts[0].address, amount, {
      value: ethers.utils.parseEther("2"),
    });

    const txOpen2 = await CDPManagerContractObj.connect(
      senderAccounts[1]
    ).openCDPandMint(senderAccounts[1].address, amount, {
      value: ethers.utils.parseEther("3"),
    });

    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("true", shutdown.toString());

    let oldUserBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(senderAccounts[0].address)
    );
    let oldTreasuryBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(TreasuryContract.address)
    );
    let oldCDPManagerBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(CDPManagerContractObj.address)
    );

    const txProcess = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).processCDP("2");
    const txReclaim = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).freeCollateral("2");

    let newUserBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(senderAccounts[0].address)
    );
    let newTreasuryBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(TreasuryContract.address)
    );
    let newCDPManagerBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(CDPManagerContractObj.address)
    );

    assert.isTrue(newUserBalance > oldUserBalance);
    assert.isTrue(newTreasuryBalance > oldTreasuryBalance);
    assert.isTrue(newCDPManagerBalance < oldCDPManagerBalance);

    oldUserBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(senderAccounts[0].address)
    );
    oldTreasuryBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(TreasuryContract.address)
    );

    const txApprove = await NOIContract.connect(senderAccounts[0]).approve(
      TreasuryContract.address,
      amount
    );

    await network.provider.send("evm_increaseTime", [3660]);
    await network.provider.send("evm_mine");

    const txRedeem = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).reedemNOI(amount);

    newUserBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(senderAccounts[0].address)
    );
    newTreasuryBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(TreasuryContract.address)
    );

    assert.isTrue(newUserBalance > oldUserBalance);
    assert.isTrue(newTreasuryBalance < oldTreasuryBalance);
  });

  it("... process non existing CDP", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();

    const txParam = await ParametersContractObj.connect(
      senderAccounts[0]
    ).setGlobalCRLimit(1100);

    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("true", shutdown.toString());

    let receipt= await expect(
      ShutdownModuleObj.connect(senderAccounts[0]).processCDP("78348274")
    ).to.be.reverted;
  });

  it("... reclaim non existing CDP", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();

    const amount = "1000000000000000000000";

    const txOpen = await CDPManagerContractObj.connect(
      senderAccounts[0]
    ).openCDPandMint(senderAccounts[0].address, amount, {
      value: ethers.utils.parseEther("2"),
    });

    const txParam = await ParametersContractObj.connect(
      senderAccounts[0]
    ).setGlobalCRLimit(1100);

    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("true", shutdown.toString());

    const txProcess= await ShutdownModuleObj.connect(senderAccounts[0]).processCDP("2");

    let receipt= await expect(
      ShutdownModuleObj.connect(senderAccounts[0]).freeCollateral("78348274")
    ).to.be.reverted;
  });

  it("... reclaim CDP with debt", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();

    const amount = "1000000000000000000000";

    const txOpen = await CDPManagerContractObj.connect(
      senderAccounts[0]
    ).openCDPandMint(senderAccounts[0].address, amount, {
      value: ethers.utils.parseEther("2"),
    });

    const txParam = await ParametersContractObj.connect(
      senderAccounts[0]
    ).setGlobalCRLimit(1100);

    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("true", shutdown.toString());

    let receipt= await expect(
      ShutdownModuleObj.connect(senderAccounts[0]).freeCollateral("2")
    ).to.be.reverted;
  });

  it("... process CDP after phase one", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();

    const amount = "1000000000000000000000";

    const txOpen = await CDPManagerContractObj.connect(
      senderAccounts[0]
    ).openCDPandMint(senderAccounts[0].address, amount, {
      value: ethers.utils.parseEther("2"),
    });

    await executeActionFromMSW(
      msw,
      0,
      ShutdownModuleObj.address,
      "modifyParameters",
      ["bytes32", "uint256"],
      [ethers.utils.formatBytes32String("timeForPhaseOne"), "10"]
    );

    const txParam = await ParametersContractObj.connect(
      senderAccounts[0]
    ).setGlobalCRLimit(1100);

    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("true", shutdown.toString());

    await network.provider.send("evm_increaseTime", [3660]);
    await network.provider.send("evm_mine");

    let receipt= await expect(
      ShutdownModuleObj.connect(senderAccounts[0]).processCDP("2")
    ).to.be.reverted;
  });

  it("... reclaim CDP after phase one", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();

    const amount = "1000000000000000000000";

    const txOpen = await CDPManagerContractObj.connect(
      senderAccounts[0]
    ).openCDPandMint(senderAccounts[0].address, amount, {
      value: ethers.utils.parseEther("2"),
    });

    await executeActionFromMSW(
      msw,
      0,
      ShutdownModuleObj.address,
      "modifyParameters",
      ["bytes32", "uint256"],
      [ethers.utils.formatBytes32String("timeForPhaseOne"), "10"]
    );

    const txParam = await ParametersContractObj.connect(
      senderAccounts[0]
    ).setGlobalCRLimit(1100);

    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("true", shutdown.toString());

    const txProcess= await ShutdownModuleObj.connect(senderAccounts[0]).processCDP("2");

    await network.provider.send("evm_increaseTime", [3660]);
    await network.provider.send("evm_mine");

    let receipt= await expect(
      ShutdownModuleObj.connect(senderAccounts[0]).freeCollateral("2")
    ).to.be.reverted;
  });

  it("... redeem more NOI than in Treasury", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();

    const amount = "1000000000000000000000";

    const txOpen = await CDPManagerContractObj.connect(
      senderAccounts[0]
    ).openCDPandMint(senderAccounts[0].address, amount, {
      value: ethers.utils.parseEther("2"),
    });

    await executeActionFromMSW(
      msw,
      0,
      ShutdownModuleObj.address,
      "modifyParameters",
      ["bytes32", "uint256"],
      [ethers.utils.formatBytes32String("timeForPhaseOne"), "10"]
    );

    const txParam = await ParametersContractObj.connect(
      senderAccounts[0]
    ).setGlobalCRLimit(1100);

    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("true", shutdown.toString());

    const txProcess= await ShutdownModuleObj.connect(senderAccounts[0]).processCDP("2");

    await network.provider.send("evm_increaseTime", [3660]);
    await network.provider.send("evm_mine");

    let receipt= await expect(
      ShutdownModuleObj.connect(senderAccounts[0]).reedemNOI(amount+"0")
    ).to.be.reverted;
  });

  it("... redeem NOI not in phase two", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();

    const amount = "1000000000000000000000";

    const txOpen = await CDPManagerContractObj.connect(
      senderAccounts[0]
    ).openCDPandMint(senderAccounts[0].address, amount, {
      value: ethers.utils.parseEther("2"),
    });

    await executeActionFromMSW(
      msw,
      0,
      ShutdownModuleObj.address,
      "modifyParameters",
      ["bytes32", "uint256"],
      [ethers.utils.formatBytes32String("timeForPhaseOne"), "10"]
    );

    await executeActionFromMSW(
      msw,
      0,
      ShutdownModuleObj.address,
      "modifyParameters",
      ["bytes32", "uint256"],
      [ethers.utils.formatBytes32String("timeForPhaseTwo"), "10"]
    );

    const txParam = await ParametersContractObj.connect(
      senderAccounts[0]
    ).setGlobalCRLimit(1100);

    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("true", shutdown.toString());

    const txProcess= await ShutdownModuleObj.connect(senderAccounts[0]).processCDP("2");

    let receipt= await expect(
      ShutdownModuleObj.connect(senderAccounts[0]).reedemNOI(amount)
    ).to.be.reverted;

    await network.provider.send("evm_increaseTime", [3660]);
    await network.provider.send("evm_mine");

    receipt= await expect(
      ShutdownModuleObj.connect(senderAccounts[0]).reedemNOI(amount)
    ).to.be.reverted;

  });

  it("... use contracts after shutdown", async () => {
    let shutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).shutdown();

    const amount = "1000000000000000000000";

    const txParam = await ParametersContractObj.connect(
      senderAccounts[0]
    ).setGlobalCRLimit(1100);

    const txGShutdown = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).startShutdown();

    shutdown = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
    assert.equal("true", shutdown.toString());

    let receipt= await expect(
      CDPManagerContractObj.connect(
        senderAccounts[0]
      ).openCDPandMint(senderAccounts[0].address, amount, {
        value: ethers.utils.parseEther("2"),
      })
    ).to.be.reverted;

    receipt= await expect(
      LiquidatorObj.connect(
        senderAccounts[0]
      ).liquidateCDP("2")
    ).to.be.reverted;

    await network.provider.send("evm_increaseTime", [3660]);
    await network.provider.send("evm_mine");

    receipt= await expect(
      MarketTwapObj.connect(
        senderAccounts[0]
      ).update()
    ).to.be.reverted;

  });
});
