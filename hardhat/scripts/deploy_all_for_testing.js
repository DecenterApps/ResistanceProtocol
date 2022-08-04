const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const deployedContracts = new Map();

const ethersInterface = new ethers.utils.Interface([
    "function addAuthorization(address account)",
    "function setCdpManagerContractAddress(address)",
]);

async function executeActionFromMSW(
    signers,
    MultiSigWalletContract,
    ethAmount,
    functionSignature,
    args
) {
    const actionIndx = (await MultiSigWalletContract.getTransactionCount()).toString();

    await MultiSigWalletContract.connect(signers[0]).submitTransaction(
        MultiSigWallet.address,
        ethAmount,
        ethersInterface.encodeFunctionData(functionSignature, args)
    );

    await MultiSigWalletContract.connect(signers[0]).confirmTransaction(actionIndx);
    await MultiSigWalletContract.connect(signers[1]).confirmTransaction(actionIndx);

    await MultiSigWalletContract.connect(signers[0]).executeTransaction(actionIndx);
}

async function deployContracts() {
    const signers = [];
    const owners = [];

    signers.push((await hre.ethers.getSigners())[0]);
    signers.push((await hre.ethers.getSigners())[1]);
    signers.push((await hre.ethers.getSigners())[2]);

    owners.push(signers[0].address);
    owners.push(signers[1].address);
    owners.push(signers[2].address);

    const MultiSigWallet = await hre.ethers.getContractFactory("MultiSigWallet");
    const MultiSigWalletContract = await MultiSigWallet.deploy(owners);
    await MultiSigWalletContract.deployed();
    deployedContracts.set("MultiSigWallet", MultiSigWalletContract);

    const name = "ResistanceProtocol";
    const symbol = "NOI";
    //const chainId = network.config.chainId;

    const Noi = await hre.ethers.getContractFactory("NOI");
    const NoiContract = await Noi.deploy(MultiSigWalletContract.address, name, symbol, "1");
    await NoiContract.deployed();
    deployedContracts.set("NOI", NoiContract);

    const AbsPiController = await hre.ethers.getContractFactory("AbsPiController");
    const AbsPiControllerContract = await AbsPiController.deploy(
        MultiSigWalletContract.address,
        "75000000000",
        "24000",
        "0",
        "0",
        "0",
        "999999711200000000000000000"
    );
    await AbsPiControllerContract.deployed();
    deployedContracts.set("AbsPiController", AbsPiControllerContract);

    const CDPManager = await hre.ethers.getContractFactory("CDPManager");
    const CDPManagerContract = await CDPManager.deploy(
        MultiSigWalletContract.address,
        NoiContract.address
    );
    await CDPManagerContract.deployed();
    deployedContracts.set("CDPManager", CDPManagerContract);

    const Treasury = await hre.ethers.getContractFactory("Treasury");
    const TreasuryContract = await Treasury.deploy(MultiSigWalletContract.address);
    await TreasuryContract.deployed();
    deployedContracts.set("Treasury", TreasuryContract);

    const Liquidator = await hre.ethers.getContractFactory("Liquidator");
    const LiquidatorContract = await Liquidator.deploy(MultiSigWalletContract.address);
    await LiquidatorContract.deployed();
    deployedContracts.set("Liquidator", LiquidatorContract);

    const Parameters = await hre.ethers.getContractFactory("Parameters");
    const ParametersContract = await Parameters.deploy(MultiSigWalletContract.address);
    await ParametersContract.deployed();
    deployedContracts.set("Parameters", ParametersContract);

    let ethUsdPriceFeedAddress = networkConfig[1].ethUsdPriceFeed;
    let cpiDataFeedAddress = networkConfig[1].cpiDataFeed;

    const RateSetter = await hre.ethers.getContractFactory("RateSetter");
    const RateSetterContract = await RateSetter.deploy(
        MultiSigWalletContract.address,
        CDPManagerContract.address,
        AbsPiControllerContract.address,
        ethUsdPriceFeedAddress,
        cpiDataFeedAddress
    );
    await RateSetterContract.deployed();
    deployedContracts.set("RateSetter", RateSetterContract);

    // connect contracts
    executeActionFromMSW(signers, MultiSigWalletContract, 0, "addAuthorization", [
        CDPManagerContract.address,
    ]);
    //await NoiContract.addAuthorization(CDPManagerContract.address);
    await LiquidatorContract.setCdpManagerContractAddress(CDPManagerContract.address);
    await LiquidatorContract.setParametersContractAddress(ParametersContract.address);
    await LiquidatorContract.setTreasuryContractAddress(TreasuryContract.address);
    await LiquidatorContract.setNoiContractAddress(NoiContract.address);
    await CDPManagerContract.setLiquidatorContractAddress(LiquidatorContract.address);
    await CDPManagerContract.setParametersContractAddress(ParametersContract.address);
}

module.exports = { deployContracts, deployedContracts };
