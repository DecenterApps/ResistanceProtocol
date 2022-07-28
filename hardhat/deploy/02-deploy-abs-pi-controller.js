const { getNamedAccounts, deployments, network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log("----------------------------------------------------");
    log("Deploying AbsPiControllerContract and waiting for confirmations...");

    const AbsPiControllerContract = await deploy("AbsPiController", {
        from: deployer,
        args: ["75000000000","24000","0","0","0","999999711200000000000000000"],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log(`AbsPiControllerContract deployed at ${AbsPiControllerContract.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(AbsPiControllerContract.address, ["75000000000","24000","0","0","0","999999711200000000000000000"]);
    }
};

module.exports.tags = ["all", "abspicontroller"];
