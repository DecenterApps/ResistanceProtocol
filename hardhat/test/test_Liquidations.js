const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai")
const BigNumber = require('big-number');
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const { executeActionFromMSW } = require("../utils/multiSigAction");

const {openAndMintFromCDP, expectToFailWithError} = require("../utils/positionActions");

describe("Liquidations", function () {
  this.timeout(80000);
  let senderAcc;
  let multiSigWallet;
  let CDPManagerContractObj, noiContractObj, LiquidatorContractObj, ParametersContractObj, RateSetterContractObj;
  let owner;
  let deployer;
  const wei = new BigNumber(10).pow(18);

  beforeEach(async () => {
    snapshot = await takeSnapshot();
  });

  afterEach(async () => {
      await revertToSnapshot(snapshot);
  });

  before(async () => {
    deployer = (await getNamedAccounts()).deployer;


    // getContract gets the most recent deployment for the specified contract
    noiContractObj = await ethers.getContract("NOI", deployer);
    CDPManagerContractObj = await ethers.getContract("CDPManager", deployer);
    LiquidatorContractObj = await ethers.getContract("Liquidator", deployer);
    ParametersContractObj = await ethers.getContract("Parameters", deployer);
    RateSetterContractObj = await ethers.getContract("RateSetter", deployer);
    multiSigWallet = await ethers.getContract("MultiSigWallet", deployer);

    senderAcc = await hre.ethers.getSigners();
    owner = senderAcc[0];

  });


  it("... should liquidate CDP", async () => {


    let cdpIndex = await openAndMintFromCDP(CDPManagerContractObj, senderAcc[1],13,10000);

    // should be set by the multi sig
    await executeActionFromMSW(
        multiSigWallet,
        0,
        ParametersContractObj.address,
        "setLR",
        ["uint8"],
        [150]
    );

    await openAndMintFromCDP(CDPManagerContractObj, senderAcc[2],20,10001);

    const approveCDPManager = await noiContractObj.connect(senderAcc[2]).approve(CDPManagerContractObj.address, BigNumber(10).pow(18).mult(10001).toString());
    await approveCDPManager.wait();

    const liquidateCDP = await LiquidatorContractObj.connect(senderAcc[2]).liquidateCDP(cdpIndex);
    await liquidateCDP.wait();
  });

  it("... should fail Liquidation", async () => {

    const cdpIndex = await openAndMintFromCDP(CDPManagerContractObj, senderAcc[1],13,1000);

    expectToFailWithError(
      LiquidatorContractObj.connect(owner).liquidateCDP(cdpIndex),
      "Liquidator__CDPNotEligibleForLiquidation()"
    );

  });
  
});
