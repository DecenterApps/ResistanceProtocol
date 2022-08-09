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

    const sendToBot = await owner.sendTransaction({
        to: process.env.BOT_ACCOUNT,
        value: ethers.utils.parseEther("100.0"),
    });

    await sendToBot.wait();

};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});