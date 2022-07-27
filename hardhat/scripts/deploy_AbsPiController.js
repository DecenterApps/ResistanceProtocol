const hre = require("hardhat");
const { verify } = require("../utils/verify");

async function main() {
  const Contract = await hre.ethers.getContractFactory("AbsPiController");

  const contract = await Contract.deploy("-2","2","10","-10","200");

  await contract.deployed();

  await contract.deployTransaction.wait(5);

  console.log("Contract deployed to: ", contract.address);

  // verify contract on etherscan
  if (network.name != "localhost" && process.env.ETHERSCAN_API_KEY) {
    await verify(contract.address, ["-2","2","10","-10","200"]);
  }
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
