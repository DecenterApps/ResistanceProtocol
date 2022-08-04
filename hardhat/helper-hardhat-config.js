const networkConfig = {
    31337: {
        name: "localhost",
    },
    42: {
        name: "kovan",
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    },
    1: {
        name: "mainnet",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        cpiDataFeed: "0x7086F2aCB5558043fF9cE3df346D8E3FB4F4f452",
    }
}

const developmentChains = ["hardhat", "localhost", "mainnet"]

module.exports = {
    networkConfig,
    developmentChains,
}