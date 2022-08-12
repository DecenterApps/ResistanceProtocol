const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { executeActionFromMSW } = require("../utils/multiSigAction");
const spawn = require("child_process").spawn;

async function prepare_update_bot() {
    const { deployer } = await getNamedAccounts();
    const [owner] = await ethers.getSigners();

    const AmountToSendToTreasury = "100.0"
    const InitialBotBalance = "0.001"

    const Treasury= await ethers.getContract("Treasury", deployer);

    const tx = await owner.sendTransaction({
        to: Treasury.address,
        value: ethers.utils.parseEther(AmountToSendToTreasury),
    });

    await tx.wait();

    // add balance so bot can get more from treasury
    const sendToBot = await owner.sendTransaction({
        to: process.env.UPDATE_BOT_ACCOUNT,
        value: ethers.utils.parseEther(AmountToSendToTreasury),
    });

    await sendToBot.wait();

    console.log("=====================================")
    console.log("Update Bot Balance: " + ethers.utils.formatEther(ethers.utils.parseEther(InitialBotBalance)) + " ETH")
    console.log("Treasury Balance: " + ethers.utils.formatEther(ethers.utils.parseEther(AmountToSendToTreasury)) + " ETH")
    console.log("=====================================")
}

async function prepare_liquidation_bot() {
    const { deployer } = await getNamedAccounts();
    const [owner] = await ethers.getSigners();
  
    const CDPManager = await ethers.getContract("CDPManager", deployer);
    const NOI = await ethers.getContract("NOI", deployer);
    const provider = CDPManager.provider;
  
    // send eth to bot balance so he can mint
    const sendEthToBot = await owner.sendTransaction({
      to: process.env.LIQUIDATION_BOT_ACCOUNT,
      value: ethers.utils.parseEther("1100"),
    });
    await sendEthToBot.wait();
  
    const botSigner = new ethers.Wallet(process.env.LIQUIDATION_BOT_PRIVATE_KEY, provider);
  
    // open cdp with bot account
    const txOpenCDP = await CDPManager.connect(botSigner).openCDP(
      botSigner.address,
      {
        value: ethers.utils.parseEther("1000"),
      }
    );
    await txOpenCDP.wait();
  
    const getCDPIndex = await CDPManager.connect(botSigner).cdpi();
  
    const mintTx = await CDPManager.connect(botSigner).mintFromCDP(
      getCDPIndex.toString(),
      ethers.utils.parseEther("100000")
    );
    await mintTx.wait();
  
    console.log("Bot Balance:");
    console.log(
      "ETH: ",
      
    );
    console.log(
      "NOI: ",
      ethers.utils.formatEther(await NOI.balanceOf(botSigner.address))
    );

    const LiquidationBotBalance = ethers.utils.formatEther(await provider.getBalance(botSigner.address))
    const LiquidationBotBalanceNOI = ethers.utils.formatEther(await NOI.balanceOf(botSigner.address))

    console.log("=====================================")
    console.log("Liquidation Bot Balance: " + LiquidationBotBalance + " ETH")
    console.log("Noi Bot Balance: " + LiquidationBotBalanceNOI + " ETH")
    console.log("=====================================")
}

module.exports = async ({ getNamedAccounts }) => {

    prepare_update_bot();
    prepare_liquidation_bot();

    // const { deployer } = await getNamedAccounts();

    // console.log("----------------------------------------------------");
    // console.log("Deploying Bots...");

    // const msw = await ethers.getContract("MultiSigWallet", deployer);
    // const TreasuryContractObj = await ethers.getContract("Treasury", deployer);

    // // add auth to cdpManager to mint and burn tokens from erc20
    // await executeActionFromMSW(
    //     msw,
    //     0,
    //     TreasuryContractObj.address,
    //     "addAuthorization",
    //     ["address"],
    //     [process.env.BOT_ACCOUNT]
    // );

    // const updateBot = spawn('python', ["../../backend/updateBot.py", process.env.BOT_ACCOUNT, process.env.BOT_PRIVATE_KEY]);
};

module.exports.tags = ["all", "deploybots"];
