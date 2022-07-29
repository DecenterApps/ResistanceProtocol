const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    owner = (await ethers.getSigners())[0];

    console.log("----------------------------------------------------");
    console.log("Adding Authorizations...");

    const noiContract = await ethers.getContract("NOI", deployer);
    const cdpManagerContract = await ethers.getContract("CDPManager", deployer);
    const LiquidatorContractObj = await ethers.getContract("Liquidator", deployer);
    const ParametersContractObj = await ethers.getContract("Parameters", deployer);

    // add auth to cdpManager to mint and burn tokens from erc20
    const tx = await noiContract.addAuthorization(cdpManagerContract.address);
    await tx.wait();

    await LiquidatorContractObj.setCdpManagerContractAddress(cdpManagerContract.address);
    await LiquidatorContractObj.setParametersContractAddress(ParametersContractObj.address);
    await LiquidatorContractObj.setTreasuryContractAddress(owner.address);
    await LiquidatorContractObj.setNoiContractAddress(noiContract.address);
    await cdpManagerContract.setLiquidatorContractAddress(LiquidatorContractObj.address);
    await cdpManagerContract.setParametersContractAddress(ParametersContractObj.address);
};

module.exports.tags = ["all", "addauthorization"];
