const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // getContract gets the most recent deployment for the specified contract
    //const coinAddress = (await ethers.getContract("NOI", deployer)).address;

    const cdpManagerContractObj = await ethers.getContract("CDPManager", deployer);
    const TreasuryContractObj = await ethers.getContract("Treasury", deployer);
    const ParametersContractObj = await ethers.getContract("Parameters", deployer);


    log("----------------------------------------------------");
    log("Deploying ShutdownModule and waiting for confirmations...");
    const ShutdownModule = await deploy("ShutdownModule", {
        from: deployer,
        args: [ParametersContractObj.address,TreasuryContractObj.address,cdpManagerContractObj.address],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`CDPManager deployed at ${ShutdownModule.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(ShutdownModule.address, [ParametersContractObj.address,TreasuryContractObj.address,cdpManagerContractObj.address]);
    }
};

module.exports.tags = ["all", "shutdown"];
