const hre = require("hardhat");
const { assert, expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");

describe("ShutdownModule", function () {
  const senderAccounts = [];
  let owner;
  let CDPManagerContractObj;
  let deployer;
  let ShutdownModuleObj;
  let ParametersContractObj;
  let NOIContract;
  let TreasuryContract;

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

    const txOpen = await CDPManagerContractObj.connect(
      senderAccounts[0]
    ).openCDPandMint(senderAccounts[0].address, "1000000000000000000000", {
      value: ethers.utils.parseEther("2"),
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
      "1000000000000000000000"
    );
    await txApprove.wait();

    const txRedeem = await ShutdownModuleObj.connect(
      senderAccounts[0]
    ).reedemNOI("1000000000000000000000");

    newUserBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(senderAccounts[0].address)
    );
    newTreasuryBalance = ethers.utils.formatEther(
      await waffle.provider.getBalance(TreasuryContract.address)
    );

    assert.isTrue(newUserBalance > oldUserBalance);
    assert.isTrue(newTreasuryBalance < oldTreasuryBalance);
  });
});
