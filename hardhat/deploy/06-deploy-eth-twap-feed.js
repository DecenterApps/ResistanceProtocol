const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;

  const ethPriceRefreshInterval = 3600; // 60 min
  const ethTwapInterval = 24; // twap window 24h

  if (chainId == 31337) {
    // real for fork
    // ethUsdPriceFeedAddress = networkConfig[1].ethUsdPriceFeed;
    // mock contracts
    ethUsdPriceFeedAddress = (
      await ethers.getContract("EthPriceFeedMock", deployer)
    ).address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const mswAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;

  log("----------------------------------------------------");
  log("Deploying EthTwapFeed and waiting for confirmations...");
  const EthTwapFeed = await deploy("EthTwapFeed", {
    from: deployer,
    args: [
      mswAddress,
      ethPriceRefreshInterval,
      ethTwapInterval,
      ethUsdPriceFeedAddress,
    ],
    log: true,
    // wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`EthTwapFeed deployed at ${EthTwapFeed.address}`);

  // verify contract on etherscan
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(EthTwapFeed.address, [
      mswAddress,
      ethPriceRefreshInterval,
      ethTwapInterval,
      ethUsdPriceFeedAddress,
    ]);
  }
};

module.exports.tags = ["all", "ethtwapfeed"];
