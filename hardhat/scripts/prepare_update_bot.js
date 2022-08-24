const { ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const [owner] = await ethers.getSigners();

    const Treasury= await ethers.getContract("Treasury", deployer);

    const tx = await owner.sendTransaction({
        to: Treasury.address,
        value: ethers.utils.parseEther("100.0"),
    });

    await tx.wait();

    const balance = await Treasury.provider.getBalance(Treasury.address);
    console.log("Treasury balance: ", balance.toString())

    // add balance so bot can get more from treasury
    const sendToBot = await owner.sendTransaction({
        to: process.env.UPDATE_BOT_ACCOUNT,
        value: ethers.utils.parseEther("0.001"),
    });

    await sendToBot.wait();

};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});