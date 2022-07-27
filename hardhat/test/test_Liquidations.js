const hre = require("hardhat");
var chai = require('chai')
const expect = chai.expect;
describe("Liquidations", function () {
  this.timeout(80000);
  let senderAcc;
  let CDPManagerContractObj, noiContractObj, LiquidatorContractObj, ParametersContractObj, TreasuryContractObj;
  let owner;
  let LiquidatorContract;
  before(async () => {

    const NoiContract = await hre.ethers.getContractFactory("NOI");
    noiContractObj = await NoiContract.deploy("NOI", "NOI", 42);
    await noiContractObj.deployed();
    console.log("NOI Contract deployed to: ", noiContractObj.address);

    const CDPManagerContract = await hre.ethers.getContractFactory("CDPManager");
    CDPManagerContractObj = await CDPManagerContract.deploy(noiContractObj.address);
    await CDPManagerContractObj.deployed();

    LiquidatorContract = await hre.ethers.getContractFactory("Liquidator");
    LiquidatorContractObj = await LiquidatorContract.deploy();
    await LiquidatorContractObj.deployed();

    const ParametersContract = await hre.ethers.getContractFactory("Parameters");
    ParametersContractObj = await ParametersContract.deploy();
    await ParametersContractObj.deployed();

    /*const TreasuryContract = await hre.ethers.getContractFactory("Treasury");
    TreasuryContractObj = await TreasuryContract.deploy();
    await TreasuryContractObj.deployed();*/

    senderAcc = await hre.ethers.getSigners();
    owner = senderAcc[0];

    await LiquidatorContractObj.connect(owner).setCdpManagerContractAddress(CDPManagerContractObj.address);
    await LiquidatorContractObj.connect(owner).setParametersContractAddress(ParametersContractObj.address);
    await LiquidatorContractObj.connect(owner).setTreasuryContractAddress(owner.address);
    await CDPManagerContractObj.connect(owner).setLiquidatorContractAddress(LiquidatorContractObj.address);

  });
  it("... should liquidate CDP", async () => {
    

    const txAddAuthToCDPManager = await noiContractObj.connect(owner).addAuthorization(CDPManagerContractObj.address);
    await txAddAuthToCDPManager.wait();

    const txOpenCDP = await CDPManagerContractObj.connect(senderAcc[1]).openCDP(senderAcc[1].address, {value: ethers.utils.parseEther("110")});
    await txOpenCDP.wait();
    const getCDPIndex = await CDPManagerContractObj.connect(senderAcc[1]).cdpi();
    const cdpIndex = getCDPIndex.toString();

    const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAcc[1]).mintFromCDP(cdpIndex, "100");
    await txmintFromCDPManager.wait();

    const liquidateCDP = await LiquidatorContractObj.connect(owner).liquidateCDP(cdpIndex);
    await liquidateCDP.wait();


  });

  it("... should fail Liquidation", async () => {
    const txAddAuthToCDPManager = await noiContractObj.connect(owner).addAuthorization(CDPManagerContractObj.address);
    await txAddAuthToCDPManager.wait();

    const txOpenCDP = await CDPManagerContractObj.connect(senderAcc[1]).openCDP(senderAcc[1].address, {value: ethers.utils.parseEther("130")});
    await txOpenCDP.wait();
    const getCDPIndex = await CDPManagerContractObj.connect(senderAcc[1]).cdpi();
    const cdpIndex = getCDPIndex.toString();

    const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAcc[1]).mintFromCDP(cdpIndex, "100");
    await txmintFromCDPManager.wait();

    // const liquidateCDP = await LiquidatorContractObj.connect(owner).liquidateCDP(cdpIndex);
    await expect(LiquidatorContractObj.connect(owner).liquidateCDP(cdpIndex)).to.be.revertedWithCustomError(
      LiquidatorContract,
      "Liquidator__CDPNotEligibleForLiquidation"
    );
  });
});
