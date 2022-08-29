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
    const ShutdownModule = await ethers.getContract("ShutdownModule", deployer);

    // noiContract

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
        noiContract.address,
        "addAuthorization",
        ["address"],
        [TreasuryContractObj.address]
    );

    //Liquidator

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
        LiquidatorContractObj.address,
        "setShutdownModuleContractAddress",
        ["address"],
        [ShutdownModule.address]
    );

    //CDP Manager

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
        cdpManagerContractObj.address,
        "addAuthorization",
        ["address"],
        [RateSetterContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        cdpManagerContractObj.address,
        "addAuthorization",
        ["address"],
        [ShutdownModule.address]
    );

    // Treasury
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
        TreasuryContractObj.address,
        "setCDPManagerContractAddress",
        ["address"],
        [cdpManagerContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        TreasuryContractObj.address,
        "setShutdownModuleContractAddress",
        ["address"],
        [ShutdownModule.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        TreasuryContractObj.address,
        "setNOIContractAddress",
        ["address"],
        [noiContract.address]
    );

    // Market TWAP Feed

    await executeActionFromMSW(
        msw,
        0,
        MarketTwapFeed.address,
        "addAuthorization",
        ["address"],
        [ShutdownModule.address]
    );

    //ETH TWAP Feed
    
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
        EthTwapFeed.address,
        "addAuthorization",
        ["address"],
        [ShutdownModule.address]
    );

    //RateSetter

    await executeActionFromMSW(
        msw,
        0,
        RateSetterContractObj.address,
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
        [ShutdownModule.address]
    );

    // Shutdown Module

    await executeActionFromMSW(
        msw,
        0,
        ShutdownModule.address,
        "setParametersAddress",
        ["address"],
        [ParametersContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        ShutdownModule.address,
        "setTreasuryAddress",
        ["address"],
        [TreasuryContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        ShutdownModule.address,
        "setCdpmanagerAddress",
        ["address"],
        [cdpManagerContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        ShutdownModule.address,
        "setLiquidatorAddress",
        ["address"],
        [LiquidatorContractObj.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        ShutdownModule.address,
        "setEthTWAPAddress",
        ["address"],
        [EthTwapFeed.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        ShutdownModule.address,
        "setMarketTWAPAddress",
        ["address"],
        [MarketTwapFeed.address]
    );

    await executeActionFromMSW(
        msw,
        0,
        ShutdownModule.address,
        "setRateSetterAddress",
        ["address"],
        [RateSetterContractObj.address]
    );

    
};

module.exports.tags = ["all", "addauthorization"];
