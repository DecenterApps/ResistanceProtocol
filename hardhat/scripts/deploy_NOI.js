const hre = require("hardhat");
const { verify } = require("../utils/verify");

async function main() {
  const Contract = await hre.ethers.getContractFactory("NOI");

  const contract = await Contract.deploy("NOI", "NOI", 42);

  await contract.deployed();

  await contract.deployTransaction.wait(1);

  console.log("Contract deployed to: ", contract.address);

  // verify contract on etherscan
  if (network.name != "localhost" && process.env.ETHERSCAN_API_KEY) {
    await verify(contract.address, ["NOI", "NOI", 42]);
  }
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
