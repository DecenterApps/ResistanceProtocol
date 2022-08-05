const hre = require('hardhat');
const { assert, expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const { ethers } = require('hardhat');
//const { executeActionFromMSW } = require("../utils/multiSigAction");

describe('ExchangePool', function () {    //former RateSetter
    const senderAccounts = [];
    //let owner;
    let noiContractObj;
    let daiContractObj;
    let CDPManagerContractObj;
    let deployer;
    let daiAddr;
    let RouterContractObj;
    //let AbsPiControllerContractObj;
    //let RateSetterContractObj; 
    //let multiSigWallet;

    beforeEach(async () => {
        snapshot = await takeSnapshot();
    });

    afterEach(async () => {
        await revertToSnapshot(snapshot);
    });

    before(async () => {
        deployer = (await getNamedAccounts()).deployer;
        daiAddr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        //multiSigWallet = await ethers.getContract("MultiSigWallet", deployer);
        noiContractObj = await ethers.getContract("NOI", deployer);
        RouterContractObj = await hre.ethers.getContractAt("IRouter02", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
        daiContractObj = await hre.ethers.getContractAt("IERC20", "0x6B175474E89094C44Da98b954EedeAC495271d0F");   //mozda nece raditi nigger
        CDPManagerContractObj = await ethers.getContract("CDPManager", deployer);
        //RateSetterContractObj = await ethers.getContract("RateSetter", deployer);
        ExchangePoolContractObj = await ethers.getContract("ExchangePool", deployer);
        //AbsPiControllerContractObj = await ethers.getContract("AbsPiController", deployer);

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

        const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(cdpIndex, "1000000");
        await txmintFromCDPManager.wait();
        console.log("Mintovao kako treba\n");

        console.log("Autorizovanje rutera:");
        const txAuthorizeRouter = await daiContractObj.connect(senderAccounts[1]).approve(RouterContractObj.address, 1000000);
        await txAuthorizeRouter.wait();

        console.log("COCK");
        const txTrialNigger = await ExchangePoolContractObj.connect(senderAccounts[1]).getRouterAddress();
        console.log(txTrialNigger.toString());
        
        console.log("Uzimanje DAIja: ");
        //const txGetDaiFromUniPool = await ExchangePoolContractObj.connect(senderAccounts[1]).getDAI(1000,{value: ethers.utils.parseEther("12")});
        let wethAddr = await RouterContractObj.connect(senderAccounts[1]).WETH();
        const txGetDaiFromUniPool = await RouterContractObj.connect(senderAccounts[1]).swapETHForExactTokens(100000,[wethAddr,daiAddr], senderAccounts[1].address,2**256-1,{value: ethers.utils.parseEther("1200")});
        console.log(txGetDaiFromUniPool.toString());
        await txGetDaiFromUniPool.wait();

        console.log("Davanje likvidnosti:");
        const txProvideLiq = await ExchangePoolContractObj.connect(senderAccounts[1]).provideLiquidity(1000000, 1000000);
        await txProvideLiq.wait();

        const getPoolVals = ExchangePoolContractObj.connect(senderAccounts[1]).getReserves();
        await getPoolVals.wait();

        assert.isAtLeast(getPoolVals[0],100000,"Required liquidity[0] not in pool");
        assert.isAtLeast(getPoolVals[1],100000,"Required liquidity[1] not in pool");

        //assert.equal("9999000000000000000000", receipt.toString());
    });

    /*it('... provide liquidity by multiple addresses', async () => {     
        const txOpenCPD = [];
        const txMintFromCDPManager = [];
        const txAuthorizeRouter = [];
        const txGetDaiFromUniPool = [];
        const txProvideLiq = [];

        for(let i = 1; i < 5; i++){
            txOpenCDP.push(await CDPManagerContractObj.connect(senderAccounts[i]).openCDP(senderAccounts[i].address, {value: ethers.utils.parseEther("12")}));
            await txOpenCDP[i].wait();

            txMintFromCDPManager.push(await CDPManagerContractObj.connect(senderAccounts[i]).mintFromCDP(cdpIndex, "1000000"));
            await txMintFromCDPManager[i].wait();

            txAuthorizeRouter.push(await daiContractObj.connect(senderAccounts[i]).approve(RouterContractObj.address, 1000000));
            await txAuthorizeRouter[i].wait();

            txGetDaiFromUniPool.push(await ExchangePoolContractObj.connect(senderAccounts[i]).getDAI(1000000));
            await txGetDaiFromUniPool[i].wait();

            txProvideLiq.push(await ExchangePoolContractObj.connect(senderAccounts[i]).provideLiquidity(1000000, 1000000));
            await txGetDaiFromUniPool[i].wait();
        }
        
        //get NOI  
        const txOpenCDP1 = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP1.wait();
        const txOpenCDP2 = await CDPManagerContractObj.connect(senderAccounts[2]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP2.wait();
        const txOpenCDP3 = await CDPManagerContractObj.connect(senderAccounts[3]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP3.wait();
        const txOpenCDP4 = await CDPManagerContractObj.connect(senderAccounts[4]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP4.wait();

        //get DAI
        const txAuthorizeRouter1 = await daiContractObj.connect(senderAccounts[1]).approve(RouterContractObj.address, 1000000);
        await txAuthorizeRouter1.wait();
        const txAuthorizeRouter2 = await daiContractObj.connect(senderAccounts[2]).approve(RouterContractObj.address, 1000000);
        await txAuthorizeRouter2.wait();
        const txAuthorizeRouter3 = await daiContractObj.connect(senderAccounts[3]).approve(RouterContractObj.address, 1000000);
        await txAuthorizeRouter3.wait();
        const txAuthorizeRouter4 = await daiContractObj.connect(senderAccounts[4]).approve(RouterContractObj.address, 1000000);
        await txAuthorizeRouter4.wait();
        
        //authorize Router
        const txGetDaiFromUniPool1 = await ExchangePoolContractObj.connect(senderAccounts[1]).getDAI(1000000);
        await txGetDaiFromUniPool1.wait();
        const txGetDaiFromUniPool2 = await ExchangePoolContractObj.connect(senderAccounts[2]).getDAI(1000000);
        await txGetDaiFromUniPool2.wait();
        const txGetDaiFromUniPool3 = await ExchangePoolContractObj.connect(senderAccounts[2]).getDAI(1000000);
        await txGetDaiFromUniPool3.wait();
        const txGetDaiFromUniPool4 = await ExchangePoolContractObj.connect(senderAccounts[2]).getDAI(1000000);
        await txGetDaiFromUniPool4.wait();

        //provide Liquidity
        const txProvideLiq1 = await ExchangePoolContractObj.connect(senderAccounts[1]).provideLiquidity(1000000, 1000000);
        await txProvideLiq1.wait();
        const txProvideLiq2 = ExchangePoolContractObj.connect(senderAccounts[2]).provideLiquidity(1000000, 1000000);
        await txProvideLiq2.wait();
        const txProvideLiq3 = ExchangePoolContractObj.connect(senderAccounts[3]).provideLiquidity(1000000, 1000000);
        await txProvideLiq3.wait();
        const txProvideLiq4 = ExchangePoolContractObj.connect(senderAccounts[4]).provideLiquidity(1000000, 1000000);
        await txProvideLiq4.wait();

        const getPoolVals = ExchangePoolContractObj.connect(senderAccounts[1]).getReserves();
        await getPoolVals.wait();

        //TODO: check if liquidity in pool is good
    });

    it('... single provide & remove of liquid assets', async () => {        
        const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP.wait();

        const txChangeRate = await RateSetterContractObj.connect(senderAccounts[0]).updateCDPManagerData();
        await txChangeRate.wait();

        await executeActionFromMSW(
            multiSigWallet,
            0,
            CDPManagerContractObj.address,
            "removeAuthorization",
            ["address"],
            [RateSetterContractObj.address]
        );

        await expect(RateSetterContractObj.connect(senderAccounts[0]).updateCDPManagerData()).to.be.reverted;
    });*/
});

