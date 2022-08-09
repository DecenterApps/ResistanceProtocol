const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { executeActionFromMSW } = require("../utils/multiSigAction");
const spawn = require("child_process").spawn;

module.exports = async ({ getNamedAccounts }) => {
    // const { deployer } = await getNamedAccounts();

    // console.log("----------------------------------------------------");
    // console.log("Deploying Bots...");

    // const msw = await ethers.getContract("MultiSigWallet", deployer);
    // const TreasuryContractObj = await ethers.getContract("Treasury", deployer);

    // // add auth to cdpManager to mint and burn tokens from erc20
    // await executeActionFromMSW(
    //     msw,
    //     0,
    //     TreasuryContractObj.address,
    //     "addAuthorization",
    //     ["address"],
    //     [process.env.BOT_ACCOUNT]
    // );

    // const updateBot = spawn('python', ["../../backend/updateBot.py", process.env.BOT_ACCOUNT, process.env.BOT_PRIVATE_KEY]);
};

module.exports.tags = ["all", "deploybots"];
