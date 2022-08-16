const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { executeActionFromMSW } = require("../utils/multiSigAction");

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    console.log("----------------------------------------------------");
    console.log("Adding Authorizations...");

    const msw = await ethers.getContract("MultiSigWallet", deployer);
    const noiContract = await ethers.getContract("NOI", deployer);
    const cdpManagerContractObj = await ethers.getContract("CDPManager", deployer);
    const LiquidatorContractObj = await ethers.getContract("Liquidator", deployer);
    const TreasuryContractObj = await ethers.getContract("Treasury", deployer);
    const ParametersContractObj = await ethers.getContract("Parameters", deployer);
    const RateSetterContractObj = await ethers.getContract("RateSetter", deployer);
    const EthTwapFeed = await ethers.getContract("EthTwapFeed", deployer);
    const MarketTwapFeed = await ethers.getContract("MarketTwapFeed", deployer);

    // add auth to cdpManager to mint and burn tokens from erc20
    await executeActionFromMSW(
        msw,
        0,
        noiContract.address,
        "addAuthorization",
        ["address"],
        [cdpManagerContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        LiquidatorContractObj.address,
        "setCdpManagerContractAddress",
        ["address"],
        [cdpManagerContractObj.address]
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
        cdpManagerContractObj.address,
        "setLiquidatorContractAddress",
        ["address"],
        [LiquidatorContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        cdpManagerContractObj.address,
        "setParametersContractAddress",
        ["address"],
        [ParametersContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        cdpManagerContractObj.address,
        "setTreasuryContractAddress",
        ["address"],
        [TreasuryContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        TreasuryContractObj.address,
        "setCDPManagerContractAddress",
        ["address"],
        [cdpManagerContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        cdpManagerContractObj.address,
        "addAuthorization",
        ["address"],
        [RateSetterContractObj.address]
    );

    // authorize updateBot
    await executeActionFromMSW(
        msw,
        0,
        TreasuryContractObj.address,
        "addAuthorization",
        ["address"],
        [process.env.UPDATE_BOT_ACCOUNT]
    );
    
    await executeActionFromMSW(
        msw,
        0,
        EthTwapFeed.address,
        "addAuthorization",
        ["address"],
        [MarketTwapFeed.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        RateSetterContractObj.address,
        "addAuthorization",
        ["address"],
        [MarketTwapFeed.address]
    );
};

module.exports.tags = ["all", "addauthorization"];
