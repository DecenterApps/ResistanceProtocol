const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai")
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

  async function openAndMintFromCDP(account, collateral, debt){

    const txOpenCDP = await CDPManagerContractObj.connect(account).openCDP(account.address, {value: ethers.utils.parseEther(collateral)});
    await txOpenCDP.wait();
    const getCDPIndex = await CDPManagerContractObj.connect(account).cdpi();
    const cdpIndex = getCDPIndex.toString();

    const txmintFromCDPManager = await CDPManagerContractObj.connect(account).mintFromCDP(cdpIndex, BigNumber(10).pow(18).mult(debt).toString());
    await txmintFromCDPManager.wait();

    return cdpIndex;
  }

  it("... should liquidate CDP", async () => {

    let cdpIndex = await openAndMintFromCDP(senderAcc[1],"130",100);

    // should be set by the multi sig
    await executeActionFromMSW(
        multiSigWallet,
        0,
        ParametersContractObj.address,
        "setLR",
        ["uint8"],
        [150]
    );

    await openAndMintFromCDP(senderAcc[2],"200",100);
    
    const approveCDPManager = await noiContractObj.connect(senderAcc[2]).approve(CDPManagerContractObj.address, BigNumber(10).pow(18).mult(100).toString());
    await approveCDPManager.wait();

    // bad cr calculation!!
    const liquidateCDP = await LiquidatorContractObj.connect(senderAcc[2]).liquidateCDP(cdpIndex);
    await liquidateCDP.wait();
  });

  it("... should fail Liquidation", async () => {

    const txOpenCDP = await CDPManagerContractObj.connect(senderAcc[1]).openCDP(senderAcc[1].address, {value: ethers.utils.parseEther("130")});
    await txOpenCDP.wait();
    const getCDPIndex = await CDPManagerContractObj.connect(senderAcc[1]).cdpi();
    const cdpIndex = getCDPIndex.toString();

    const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAcc[1]).mintFromCDP(cdpIndex, BigNumber(10).pow(18).mult(100).toString());
    await txmintFromCDPManager.wait();

    LiquidatorContract = await ethers.getContractFactory("Liquidator");
    try {
      await LiquidatorContractObj.connect(owner).liquidateCDP(cdpIndex);
    } catch (err) {
      console.log(err.toString())
        expect(err.toString()).to.have.string('Liquidator__CDPNotEligibleForLiquidation');
      }
  });
});
