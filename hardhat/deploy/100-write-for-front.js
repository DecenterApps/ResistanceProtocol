const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { getTheAbi, writeAbiAndAddress } = require('../utils/abi')

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    console.log("----------------------------------------------------");
    console.log("Writing ABIs and addresses...");

    const msw = await ethers.getContract("MultiSigWallet", deployer);
    const noiContract = await ethers.getContract("NOI", deployer);
    const cdpManagerContractObj = await ethers.getContract("CDPManager", deployer);
    const LiquidatorContractObj = await ethers.getContract("Liquidator", deployer);
    const TreasuryContractObj = await ethers.getContract("Treasury", deployer);
    const ParametersContractObj = await ethers.getContract("Parameters", deployer);
    const RateSetterContractObj = await ethers.getContract("RateSetter", deployer);
    const EthTWAPFeedContractObj = await ethers.getContract("EthTwapFeed", deployer);
    const MarketTwapFeed = await ethers.getContract("MarketTwapFeed", deployer);
    const AbsPIController = await ethers.getContract("AbsPiController", deployer);


    writeAbiAndAddress("MultiSigWallet", msw.address)
    writeAbiAndAddress("NOI", noiContract.address)
    writeAbiAndAddress("CDPManager", cdpManagerContractObj.address)
    writeAbiAndAddress("Liquidator", LiquidatorContractObj.address)
    writeAbiAndAddress("Treasury", TreasuryContractObj.address)
    writeAbiAndAddress("Parameters", ParametersContractObj.address)
    writeAbiAndAddress("RateSetter", RateSetterContractObj.address)
    writeAbiAndAddress("EthTwapFeed", EthTWAPFeedContractObj.address)
    writeAbiAndAddress("MarketTwapFeed", MarketTwapFeed.address)
    writeAbiAndAddress("AbsPiController",AbsPIController.address)


};

module.exports.tags = ["all", "writeforfront"];