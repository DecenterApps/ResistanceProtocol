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
        await CDPManagerContractObj.deployed();

        const RateSetterContract = await hre.ethers.getContractFactory("RateSetter");
        RateSetterContractObj = await RateSetterContract.deploy(CDPManagerContractObj.address);
        await RateSetterContractObj.deployed();

        owner = (await hre.ethers.getSigners())[0];

        senderAccounts.push((await hre.ethers.getSigners())[1]);
        senderAccounts.push((await hre.ethers.getSigners())[2]);
        senderAccounts.push((await hre.ethers.getSigners())[3]);
        senderAccounts.push((await hre.ethers.getSigners())[4]);
    });

    it('... mint tokens without changing the rate', async () => {        
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

    it('... mint tokens with changing the rate', async () => {        
        const txAddAuthToCDPManager = await noiContractObj.connect(owner).addAuthorization(CDPManagerContractObj.address);
        await txAddAuthToCDPManager.wait();

        const txAddAuthToRateSetter = await CDPManagerContractObj.connect(owner).addAuthorization(RateSetterContractObj.address);
        await txAddAuthToRateSetter.wait();

        const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP.wait();

        const txChangeRate = await RateSetterContractObj.connect(senderAccounts[0]).updateRates();

        const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

        const cdpIndex = getCDPIndex.toString();

        await expect(CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(cdpIndex, "9999")).to.be.reverted;
    });

    it('... remove auth from RateSetter', async () => {        
        const txAddAuthToCDPManager = await noiContractObj.connect(owner).addAuthorization(CDPManagerContractObj.address);
        await txAddAuthToCDPManager.wait();

        const txAddAuthToRateSetter = await CDPManagerContractObj.connect(owner).addAuthorization(RateSetterContractObj.address);
        await txAddAuthToRateSetter.wait();

        const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP.wait();

        const txChangeRate = await RateSetterContractObj.connect(senderAccounts[0]).updateRates();
        await txChangeRate.wait();

        const txRemoveAuthFromRateSetter = await CDPManagerContractObj.connect(owner).removeAuthorization(RateSetterContractObj.address);
        await txRemoveAuthFromRateSetter.wait();

        await expect(RateSetterContractObj.connect(senderAccounts[0]).updateRates()).to.be.reverted;
    });
});