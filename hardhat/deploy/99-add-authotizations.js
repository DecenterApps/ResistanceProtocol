const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { executeActionFromMSW } = require("../utils/multiSigAction");

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    console.log("----------------------------------------------------");
    console.log("Adding Authorizations...");

    const msw = await ethers.getContract("MultiSigWallet", deployer);
    const noiContract = await ethers.getContract("NOI", deployer);
    const cdpManagerContract = await ethers.getContract("CDPManager", deployer);
    const LiquidatorContractObj = await ethers.getContract("Liquidator", deployer);
    const TreasuryContractObj = await ethers.getContract("Treasury", deployer);
    const ParametersContractObj = await ethers.getContract("Parameters", deployer);
    const RateSetterContractObj = await ethers.getContract("RateSetter", deployer);

    // add auth to cdpManager to mint and burn tokens from erc20
    await executeActionFromMSW(
        msw,
        0,
        noiContract.address,
        "addAuthorization",
        ["address"],
        [cdpManagerContract.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        LiquidatorContractObj.address,
        "setCdpManagerContractAddress",
        ["address"],
        [cdpManagerContract.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        LiquidatorContractObj.address,
        "setParametersContractAddress",
        ["address"],
        [ParametersContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        LiquidatorContractObj.address,
        "setTreasuryContractAddress",
        ["address"],
        [TreasuryContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        LiquidatorContractObj.address,
        "setNoiContractAddress",
        ["address"],
        [noiContract.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        cdpManagerContract.address,
        "setLiquidatorContractAddress",
        ["address"],
        [LiquidatorContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        cdpManagerContract.address,
        "setParametersContractAddress",
        ["address"],
        [ParametersContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        cdpManagerContract.address,
        "addAuthorization",
        ["address"],
        [RateSetterContractObj.address]
    );
};

module.exports.tags = ["all", "addauthorization"];
