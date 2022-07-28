const { network } = require("hardhat")

const DECIMALS = "8"
const INITIAL_PRICE = "1000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // If on local network, deploy mocks
    if (chainId == 31337) {
        log("Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks Deployed to Local Network!")
    }
}
module.exports.tags = ["all", "mocks"]