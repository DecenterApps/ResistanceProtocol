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
  // deplete traders
  for (let i = 3; i < 14; i += 1) {
    const sendEth = await signers[i].sendTransaction({
      to: deployer,
      value: ethers.utils.parseEther("9950"),
    });
    await sendEth.wait();
  }

  //get noi from opening cdp
  const txOpenCDP = await CDPManager.openCDP(deployer, {
    value: ethers.utils.parseEther("1000"),
  });
  await txOpenCDP.wait();

  const getCDPIndex = await CDPManager.cdpi();

  const mintTx = await CDPManager.mintFromCDP(
    getCDPIndex.toString(),
    ethers.utils.parseEther("100000")
  );
  await mintTx.wait();

  const approveTx = await NOI.approve(
    ExhangePoolSimMock.address,
    ethers.utils.parseEther("100000")
  );
  await approveTx.wait();

  const tx = await ExhangePoolSimMock.addFunds(
    ethers.utils.parseEther("100000"),
    {
      value: ethers.utils.parseUnits("200", "ether"),
    }
  );
  await tx.wait();
};

module.exports.tags = ["all", "setupMock"];
