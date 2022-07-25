const hre = require('hardhat');
const { assert } = require("chai");

describe('Test', function () {
    this.timeout(80000);

    const senderAccounts = [];
    let owner;
    let noiContractObj;
    let CDPManagerContractObj;

    before(async () => {
        const NoiContract = await hre.ethers.getContractFactory("NOI");
        noiContractObj = await NoiContract.deploy("NOI", "NOI", 42);
        await noiContractObj.deployed();
        console.log("Contract deployed to: ", noiContractObj.address);

        const CDPManagerContract = await hre.ethers.getContractFactory("CDPManager");
        CDPManagerContractObj = await CDPManagerContract.deploy(noiContractObj.address);
        await noiContractObj.deployed();

        owner = (await hre.ethers.getSigners())[0];

        senderAccounts.push((await hre.ethers.getSigners())[1]);
        senderAccounts.push((await hre.ethers.getSigners())[2]);
        senderAccounts.push((await hre.ethers.getSigners())[3]);
        senderAccounts.push((await hre.ethers.getSigners())[4]);
    });

    it('... testing', async () => {

        //await noiContractObj.connect(senderAccounts[0]).mint({value: ethers.utils.parseEther("10")});
        
        const txAddAuthToCDPManager = await noiContractObj.connect(owner).addAuthorization(CDPManagerContractObj.address);
        await txAddAuthToCDPManager.wait();
        const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(senderAccounts[1].address, "10");
        await txmintFromCDPManager.wait();
        console.log(await noiContractObj.connect(senderAccounts[1]).balanceOf(senderAccounts[1].address))
    });
});