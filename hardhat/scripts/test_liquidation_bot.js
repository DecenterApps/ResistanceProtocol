const { ethers, getNamedAccounts } = require("hardhat");
const delay = require("../utils/delay")

let deployer, noiContractObj, CDPManagerContractObj

const senderAccounts = []

async function OpenCDP() {
    const txOpenCDP = await CDPManagerContractObj.connect(
        senderAccounts[1]
    ).openCDP(senderAccounts[1].address, {
        value: ethers.utils.parseEther("12"),
    });
    await txOpenCDP.wait();

    return (await CDPManagerContractObj.connect(
        senderAccounts[1]
    ).cdpi()).toString();
}

async function MintCDP(index) {
    const txmintFromCDPManager = await CDPManagerContractObj.connect(
        senderAccounts[1]
    ).mintFromCDP(index,  ethers.utils.parseEther("8000"));
    await txmintFromCDPManager.wait();
}

async function CloseCDP(index) {
    const tx = await CDPManagerContractObj.connect(
        senderAccounts[1]
    ).closeCDP(index);
    await tx.wait();
}

async function SetEthPrice(price){
    const tx = await EthPriceFeedMock.setPrice(price);
    await tx.wait();
    await delay(5000)
}

async function main() {
   
    deployer = (await getNamedAccounts()).deployer;

    noiContractObj = await ethers.getContract("NOI", deployer);
    CDPManagerContractObj = await ethers.getContract("CDPManager", deployer);

    EthPriceFeedMock = await ethers.getContract("EthPriceFeedMock", deployer);
    
    senderAccounts.push((await ethers.getSigners())[1]);
    senderAccounts.push((await ethers.getSigners())[2]);
    senderAccounts.push((await ethers.getSigners())[3]);
    senderAccounts.push((await ethers.getSigners())[4]);
    

    SetEthPrice("1000")

    const cdp1 = await OpenCDP();
    const cdp2 = await OpenCDP();

    await CloseCDP(cdp1);

    const cdp3 = await OpenCDP();

    await MintCDP(cdp2)

    // SetEthPrice("12000000000")
    // SetEthPrice("1200000000")

    await CloseCDP(cdp3);

    // SetEthPrice("10000")
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
