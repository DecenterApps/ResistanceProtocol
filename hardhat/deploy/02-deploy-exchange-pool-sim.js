const { getNamedAccounts, network, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const [owner] = await ethers.getSigners();

  const NOI = await ethers.getContract("NOI", deployer);
  const EthPriceFeedMock = await ethers.getContract("EthPriceFeedMock", deployer);

  log("----------------------------------------------------");
  log("Deploying ExhangePoolSimMock and waiting for confirmations...");
  const ExhangePoolSimMock = await deploy("ExchangePoolSimMock", {
    from: deployer,
    args: [NOI.address, EthPriceFeedMock.address],
    log: true,
    // wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`ExhangePoolSimMock deployed at ${ExhangePoolSimMock.address}`);
};

module.exports.tags = ["all", "ExhangePoolSimMock"];
