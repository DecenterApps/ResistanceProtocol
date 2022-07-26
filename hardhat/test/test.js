const hre = require('hardhat');
const { assert, expect } = require("chai");

describe('CDPManager', function () {
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

    it('... mint tokens from valid user address', async () => {        
        const txAddAuthToCDPManager = await noiContractObj.connect(owner).addAuthorization(CDPManagerContractObj.address);
        await txAddAuthToCDPManager.wait();

        const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP.wait();

        const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

        const cdpIndex = getCDPIndex.toString();

        const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(cdpIndex, "9999");
        await txmintFromCDPManager.wait();
        const receipt = await noiContractObj.connect(senderAccounts[1]).balanceOf(senderAccounts[1].address);

        assert.equal("9999", receipt.toString());
    });

    it('... mint more than we can handle', async () => {        
        const txAddAuthToCDPManager = await noiContractObj.connect(owner).addAuthorization(CDPManagerContractObj.address);
        await txAddAuthToCDPManager.wait();

        const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP.wait();

        const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

        const cdpIndex = getCDPIndex.toString();

        await expect(CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(cdpIndex, "10000")).to.be.reverted;
    });

    it('... mint tokens from invalid user address', async () => {        
        const txAddAuthToCDPManager = await noiContractObj.connect(owner).addAuthorization(CDPManagerContractObj.address);
        await txAddAuthToCDPManager.wait();

        const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("10")});
        await txOpenCDP.wait();

        const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

        const cdpIndex = getCDPIndex.toString();

        await expect(CDPManagerContractObj.connect(senderAccounts[2]).mintFromCDP(cdpIndex, "10")).to.be.reverted;
    });
});