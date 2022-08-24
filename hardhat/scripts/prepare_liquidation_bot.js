const { ethers } = require("hardhat");

async function main() {
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
    ethers.utils.formatEther(await provider.getBalance(botSigner.address))
  );
  console.log(
    "NOI: ",
    ethers.utils.formatEther(await NOI.balanceOf(botSigner.address))
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
