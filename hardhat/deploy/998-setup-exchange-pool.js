const { providers } = require("ethers");
const { getNamedAccounts, network, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const [owner] = await ethers.getSigners();

  const NOI = await ethers.getContract("NOI", deployer);
  const CDPManager = await ethers.getContract("CDPManager", deployer);
  const ExhangePoolSimMock = await ethers.getContract(
    "ExchangePoolSimMock",
    deployer
  );
  const signers = await ethers.getSigners();


  // deplete accounts
  for (let i = 3; i < 100; i += 1) {
    const sendEth = await signers[i].sendTransaction({
      to: deployer,
      value: ethers.utils.parseEther("9950"),
    });
    await sendEth.wait();
  }

  //get noi from opening cdp
  const txOpenCDP = await CDPManager.openCDP(deployer, {
    value: ethers.utils.parseEther("10000"),
  });
  await txOpenCDP.wait();

  const getCDPIndex = await CDPManager.cdpi();

  const mintTx = await CDPManager.mintFromCDP(
    getCDPIndex.toString(),
    ethers.utils.parseEther("3000000")
  );
  await mintTx.wait();

  // send noi to traders
  for (let i = 3; i < 13; i += 1) {
    const sendNoi = await NOI.transfer(signers[i].address, ethers.utils.parseEther("25000"));
    await sendNoi.wait();
    // const amount = await NOI.balanceOf(signers[i].address);
    // console.log(amount.toString())
  }

  const approveTx = await NOI.approve(
    ExhangePoolSimMock.address,
    ethers.utils.parseEther("2500000")
  );
  await approveTx.wait();

  const tx = await ExhangePoolSimMock.addFunds(
    ethers.utils.parseEther("2500000"),
    {
      value: ethers.utils.parseUnits("5000", "ether"),
    }
  );
  await tx.wait();
};

module.exports.tags = ["all", "setupMock"];
