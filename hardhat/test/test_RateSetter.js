const hre = require('hardhat');
const { assert, expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const { executeActionFromMSW } = require("../utils/multiSigAction");

describe('RateSetter', function () {
    const senderAccounts = [];
    let owner;
    let noiContractObj;
    let CDPManagerContractObj;
    let deployer;
    let AbsPiControllerContractObj;
    let RateSetterContractObj;
    let multiSigWallet;
    let marketTwapFeedObj;

    beforeEach(async () => {
        snapshot = await takeSnapshot();
    });

    afterEach(async () => {
        await revertToSnapshot(snapshot);
    });

    before(async () => {
        deployer = (await getNamedAccounts()).deployer;

        multiSigWallet = await ethers.getContract("MultiSigWallet", deployer);
        noiContractObj = await ethers.getContract("NOI", deployer);
        CDPManagerContractObj = await ethers.getContract("CDPManager", deployer);
        RateSetterContractObj = await ethers.getContract("RateSetter", deployer);
        AbsPiControllerContractObj = await ethers.getContract("AbsPiController", deployer);
        marketTwapFeedObj = await ethers.getContract("MarketTwapFeed", deployer);

        senderAccounts.push((await hre.ethers.getSigners())[1]);
        senderAccounts.push((await hre.ethers.getSigners())[2]);
        senderAccounts.push((await hre.ethers.getSigners())[3]);
        senderAccounts.push((await hre.ethers.getSigners())[4]);
    });

    it('... mint tokens without changing the rate', async () => {        
        const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP.wait();

        const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

        const cdpIndex = getCDPIndex.toString();

        let mintAmount= await CDPManagerContractObj.connect(senderAccounts[1]).maxMintAmount(cdpIndex);

        const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(cdpIndex, "10000000000000000000000");
        await txmintFromCDPManager.wait();
        const receipt = await noiContractObj.connect(senderAccounts[1]).balanceOf(senderAccounts[1].address);

        assert.equal("10000000000000000000000", receipt.toString());
    });

    it('... mint tokens with changing the rate', async () => {        
        const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP.wait();

        const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();

        const cdpIndex = getCDPIndex.toString();

        let redemptionPrice= await RateSetterContractObj.connect(senderAccounts[1]).getRedemptionPrice()
        let marketPrice= await marketTwapFeedObj.connect(senderAccounts[1]).getMarketPrice()

        let mintAmount= await CDPManagerContractObj.connect(senderAccounts[1]).maxMintAmount(cdpIndex);
        let ethRP= await CDPManagerContractObj.connect(senderAccounts[1]).ethRp();

        const txChangeRate = await marketTwapFeedObj.connect(senderAccounts[0]).update();

        ethRP= await CDPManagerContractObj.connect(senderAccounts[1]).ethRp();

        mintAmount= await CDPManagerContractObj.connect(senderAccounts[1]).maxMintAmount(cdpIndex);
        redemptionPrice= await RateSetterContractObj.connect(senderAccounts[1]).getRedemptionPrice()
        marketPrice= await marketTwapFeedObj.connect(senderAccounts[1]).getMarketPrice()

        await expect(CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(cdpIndex, "10000000000000000000000")).to.be.reverted;
                                                                                            
    });

    it('... get rates', async () => {     
        
        const txChangeRate = await marketTwapFeedObj.connect(senderAccounts[0]).update();

        let redemptionRate= await RateSetterContractObj.connect(senderAccounts[1]).getYearlyRedemptionRate()
        let proportionalTerm= await RateSetterContractObj.connect(senderAccounts[1]).getYearlyProportionalTerm()
        let integralTerm= await RateSetterContractObj.connect(senderAccounts[1]).getYearlyIntegralTerm()
                                                                                            
    });

});