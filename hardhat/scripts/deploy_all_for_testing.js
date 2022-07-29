const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const deployedContracts = new Map();

async function deployContracts() {
    const owner = (await ethers.getSigners())[0];
    const owners = [];

    owners.push((await ethers.getSigners())[0].address);
    owners.push((await ethers.getSigners())[1].address);
    owners.push((await ethers.getSigners())[2].address);

    const MultiSigWallet = await hre.ethers.getContractFactory("MultiSigWallet");
    MultiSigWalletContract = await MultiSigWallet.deploy(owners);
    await MultiSigWalletContract.deployed();
    deployedContracts.set("MultiSigWallet", MultiSigWalletContract);

    const name = "ResistanceProtocol";
    const symbol = "NOI";
    const chainId = network.config.chainId;

    const Noi = await hre.ethers.getContractFactory("NOI");
    NoiContract = await Noi.deploy(name, symbol, chainId);
    await NoiContract.deployed();
    deployedContracts.set("NOI", NoiContract);

    const AbsPiController = await hre.ethers.getContractFactory("AbsPiController");
    AbsPiControllerContract = await AbsPiController.deploy("75000000000", "24000", "0", "0", "0", "999999711200000000000000000");
    await AbsPiControllerContract.deployed();
    deployedContracts.set("AbsPiController", AbsPiControllerContract);

    const CDPManager = await hre.ethers.getContractFactory("CDPManager");
    CDPManagerContract = await CDPManager.deploy(NoiContract.address);
    await CDPManagerContract.deployed();
    deployedContracts.set("CDPManager", CDPManagerContract);

    const Treasury = await hre.ethers.getContractFactory("Treasury");
    TreasuryContract = await Treasury.deploy();
    await TreasuryContract.deployed();
    deployedContracts.set("Treasury", TreasuryContract);

    const Liquidator = await hre.ethers.getContractFactory("Liquidator");
    LiquidatorContract = await Liquidator.deploy();
    await LiquidatorContract.deployed();
    deployedContracts.set("Liquidator", LiquidatorContract);

    const Parameters = await hre.ethers.getContractFactory("Parameters");
    ParametersContract = await Parameters.deploy();
    await ParametersContract.deployed();
    deployedContracts.set("Parameters", ParametersContract);

    let ethUsdPriceFeedAddress = networkConfig[1].ethUsdPriceFeed;
    let cpiDataFeedAddress = networkConfig[1].cpiDataFeed;

    const RateSetter = await hre.ethers.getContractFactory("RateSetter");
    RateSetterContract = await RateSetter.deploy(CDPManagerContract.address, AbsPiControllerContract.address, ethUsdPriceFeedAddress, cpiDataFeedAddress);
    await RateSetterContract.deployed();
    deployedContracts.set("RateSetter", RateSetterContract);

    await NoiContract.addAuthorization(CDPManagerContract.address);
    await LiquidatorContract.setCdpManagerContractAddress(CDPManagerContract.address);
    await LiquidatorContract.setParametersContractAddress(ParametersContract.address);
    await LiquidatorContract.setTreasuryContractAddress(owner.address);
    await LiquidatorContract.setNoiContractAddress(NoiContract.address);
    await CDPManagerContract.setLiquidatorContractAddress(LiquidatorContract.address);
    await CDPManagerContract.setParametersContractAddress(ParametersContract.address);
}
module.exports = { deployContracts, deployedContracts };
