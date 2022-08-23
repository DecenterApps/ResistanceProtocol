const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // getContract gets the most recent deployment for the specified contract
    const marketControllerAddress = (await ethers.getContract("AbsPiController", deployer)).address;
    const multiSigWalletAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;
    const cpiControllerAddress = (await ethers.getContract("CPIController", deployer)).address;;

    log("----------------------------------------------------");
    log("Deploying FuzzyModule and waiting for confirmations...");
    const FuzzyModule = await deploy("FuzzyModule", {
        from: deployer,
        args: [multiSigWalletAddress, marketControllerAddress, cpiControllerAddress],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`FuzzyModule deployed at ${FuzzyModule.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(FuzzyModule.address, [multiSigWalletAddress, marketControllerAddress, cpiControllerAddress]);
    }
};

module.exports.tags = ["all", "fuzzymodule"];
