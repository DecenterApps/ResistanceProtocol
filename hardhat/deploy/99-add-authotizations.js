const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    console.log("----------------------------------------------------");
    console.log("Adding Authorizations...");

    const noiContract = await ethers.getContract("NOI", deployer);
    const cdpManagerContract = await ethers.getContract("CDPManager", deployer);

    signerDeployer = (await hre.ethers.getSigners())[0];

    // add auth to cdpManager to mint and burn tokens from erc20
    if (chainId == 31337) {
        const tx = await noiContract.addAuthorization(cdpManagerContract.address);
        await tx.wait();
    } else {
        const tx = await noiContract.addAuthorization(cdpManagerContract.address);
        await tx.wait();
    }
};

module.exports.tags = ["all", "addauthorization"];
