const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const chai = require('chai')
const expect = chai.expect;
const BigNumber = require('big-number');
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const { executeActionFromMSW } = require("../utils/multiSigAction");

describe("Liquidations", function () {
  this.timeout(80000);
  let senderAcc;
  let multiSigWallet;
  let CDPManagerContractObj, noiContractObj, LiquidatorContractObj, ParametersContractObj, TreasuryContractObj;
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
    TreasuryContractObj = await ethers.getContract("Treasury", deployer);
    multiSigWallet = await ethers.getContract("MultiSigWallet", deployer);

    senderAcc = await hre.ethers.getSigners();
    owner = senderAcc[0];

  });
  it("... should liquidate CDP", async () => {

    const txOpenCDP = await CDPManagerContractObj.connect(senderAcc[1]).openCDP(senderAcc[1].address, {value: "130"});
    await txOpenCDP.wait();
    const getCDPIndex = await CDPManagerContractObj.connect(senderAcc[1]).cdpi();
    const cdpIndex = getCDPIndex.toString();

    const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAcc[1]).mintFromCDP(cdpIndex, 100);
    await txmintFromCDPManager.wait();

    // should be set by the multi sig
    await executeActionFromMSW(
        multiSigWallet,
        0,
        ParametersContractObj.address,
        "setLR",
        ["uint8"],
        [150]
    );
    const approveLiquidator = await noiContractObj.connect(senderAcc[2]).approve(LiquidatorContractObj.address, 100);
    await approveLiquidator.wait();

    // bad cr calculation!!
    const liquidateCDP = await LiquidatorContractObj.connect(senderAcc[2]).liquidateCDP(cdpIndex);
    await liquidateCDP.wait();
  });

  it("... should fail Liquidation", async () => {

    const txOpenCDP = await CDPManagerContractObj.connect(senderAcc[1]).openCDP(senderAcc[1].address, {value: ethers.utils.parseEther("130")});
    await txOpenCDP.wait();
    const getCDPIndex = await CDPManagerContractObj.connect(senderAcc[1]).cdpi();
    const cdpIndex = getCDPIndex.toString();

    const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAcc[1]).mintFromCDP(cdpIndex, "100");
    await txmintFromCDPManager.wait();

    // const liquidateCDP = await LiquidatorContractObj.connect(owner).liquidateCDP(cdpIndex);
    await expect(LiquidatorContractObj.connect(owner).liquidateCDP(cdpIndex)).to.be.reverted;
  });
});
