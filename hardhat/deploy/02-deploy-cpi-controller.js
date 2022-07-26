const BigNumber = require('big-number');
const { getNamedAccounts, deployments, network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log("----------------------------------------------------");
    log("Deploying CPIControllerContract and waiting for confirmations...");

    const multiSigWalletAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;
    let precent99 = new BigNumber(10).pow(25).mult(99).toString();

    const CPIControllerContract = await deploy("CPIController", {
        from: deployer,
        args: [multiSigWalletAddress, precent99, "75000000000","24000","1500000000000000000000000000","-500000000000000000000000000","0","999999711200000000000000000"],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log(`CPIControllerContract deployed at ${CPIControllerContract.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(CPIControllerContract.address, [multiSigWalletAddress, "75000000000","24000","1500000000000000000000000000","-500000000000000000000000000","0","999999711200000000000000000"]);
    }
};

module.exports.tags = ["all", "abspicontroller"];
