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

  const PriceRefreshInterval = 3600; //3600; // 60 min
  const TwapInterval = 24; // twap window 24h

  const CoinContractAddress = (
    await ethers.getContract("EthPriceFeedMock", deployer)
  ).address;

  let lendingPoolAddress = (
    await ethers.getContract("ExchangePoolSimMock", deployer)
  ).address;

  let EthTwapFeedAddress = (await ethers.getContract("EthTwapFeed", deployer))
    .address;

  let RateSetterAddress = (await ethers.getContract("RateSetter", deployer))
    .address;

  const multiSigWalletAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;

  log("----------------------------------------------------");
  log("Deploying MarketTwapFeed and waiting for confirmations...");
  const MarketTwapFeed = await deploy("MarketTwapFeed", {
    from: deployer,
    args: [
      PriceRefreshInterval,
      TwapInterval,
      lendingPoolAddress,
      EthTwapFeedAddress,
      RateSetterAddress,
      CoinContractAddress,
      multiSigWalletAddress
    ],
    log: true,
    // wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`MarketTwapFeed deployed at ${MarketTwapFeed.address}`);

  // verify contract on etherscan
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(EthTwapFeed.address, [
      PriceRefreshInterval,
      TwapInterval,
      lendingPoolAddress,
      EthTwapFeedAddress,
      RateSetterAddress,
      CoinContractAddress,
      multiSigWalletAddress
    ]);
  }
};

module.exports.tags = ["all", "markettwapfeed"];
