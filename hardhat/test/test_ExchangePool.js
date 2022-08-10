const hre = require('hardhat');
const { assert, expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const { ethers } = require('hardhat');
const BigNumber = require('big-number');
//const { executeActionFromMSW } = require("../utils/multiSigAction");

describe('ExchangePool', function () {    //former RateSetter
    const senderAccounts = [];
    let noiContractObj;
    let daiContractObj;
    let CDPManagerContractObj;
    let deployer;
    let routerContractObj;
    let pairAddress;
    let factoryContractAddr;
    let factoryContractObj;
    let pairContractObj;
    let wethAddr;

    beforeEach(async () => {
        snapshot = await takeSnapshot();
    });

    afterEach(async () => {
        await revertToSnapshot(snapshot);
    });

    before(async () => {
        deployer = (await getNamedAccounts()).deployer;

        noiContractObj = await ethers.getContract("NOI", deployer);
        CDPManagerContractObj = await ethers.getContract("CDPManager", deployer);
        exchangePoolContractObj = await ethers.getContract("ExchangePool", deployer);

        routerContractObj = await hre.ethers.getContractAt("IRouter02", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
        daiContractObj = await hre.ethers.getContractAt("IERC20", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
        
        for(let i = 1; i <= 10; i++){
            senderAccounts.push((await hre.ethers.getSigners())[i]);
        }

        wethAddr = await routerContractObj.connect(senderAccounts[1]).WETH();

        factoryContractAddr = await routerContractObj.factory();
        factoryContractObj = await hre.ethers.getContractAt("IFactory", factoryContractAddr); 

        pairAddress = await factoryContractObj.connect(senderAccounts[1]).getPair(noiContractObj.address, daiContractObj.address);
        pairContractObj = await hre.ethers.getContractAt("IPool", pairAddress);
    });

    it('... single liquidity provider', async () => {        
        const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
        await txOpenCDP.wait();

        const getCDPIndex = await CDPManagerContractObj.connect(senderAccounts[1]).cdpi();
        const cdpIndex = getCDPIndex.toString();

        const txmintFromCDPManager = await CDPManagerContractObj.connect(senderAccounts[1]).mintFromCDP(cdpIndex, "1000000");
        await txmintFromCDPManager.wait();

        const txAuthorizeRouter = await daiContractObj.connect(senderAccounts[1]).approve(routerContractObj.address, 1000000);
        await txAuthorizeRouter.wait();
        
        const txGetDaiFromUniPool = await exchangePoolContractObj.connect(senderAccounts[1]).getDAI(1000000,{value: ethers.utils.parseEther("12")});
        await txGetDaiFromUniPool.wait();

        // const tokenAddrs = [wethAddr, daiAddr];
        // const txGetDaiFromUniPool = await RouterContractObj.connect(senderAccounts[1]).swapETHForExactTokens(
        //     10000, tokenAddrs, senderAccounts[1].address, new BigNumber(2).pow(255).toString(),{value: ethers.utils.parseEther("12")}
        // );
        // await txGetDaiFromUniPool.wait();
        

       /* const txApproveDaiPair = await daiContractObj.connect(senderAccounts[1]).approve(pairAddress, 10000000);
        await txApproveDaiPair.wait();
        const txApproveNoiPair = await noiContractObj.connect(senderAccounts[1]).approve(pairAddress, 10000000);
        await txApproveNoiPair.wait();*/

        /*const txApproveDaiRout = await daiContractObj.connect(senderAccounts[1]).approve(RouterContractObj.address, 10000000);
        await txApproveDaiRout.wait();
        const txApproveNoiRout = await noiContractObj.connect(senderAccounts[1]).approve(RouterContractObj.address, 10000000);
        await txApproveNoiRout.wait();*/
        const txApproveDaiRout = await daiContractObj.connect(senderAccounts[1]).approve(exchangePoolContractObj.address, 10000000);
        await txApproveDaiRout.wait();
        const txApproveNoiRout = await noiContractObj.connect(senderAccounts[1]).approve(exchangePoolContractObj.address, 10000000);
        await txApproveNoiRout.wait();
        

        /*const txApproveDaiEx = await daiContractObj.connect(senderAccounts[1]).approve(ExchangePoolContractObj.address, 10000000);
        await txApproveDaiEx.wait();
        const txApproveNoiEx = await noiContractObj.connect(senderAccounts[1]).approve(ExchangePoolContractObj.address, 10000000);
        await txApproveNoiEx.wait();*/

        console.log("doso");
        const getPoolVals0 = await exchangePoolContractObj.getReserves();
        const {0: noiAmount0, 1: daiAmount0, 2: timestampu0} = getPoolVals0;
        console.log("Before provide, noi :" + noiAmount0 + ", dai :" + daiAmount0);

        const txProvideLiq = await exchangePoolContractObj.connect(senderAccounts[1]).provideLiquidity(1002, 1002);
        const receipt = await txProvideLiq.wait(); 
        const topics = []
        let event;
        for(let e of receipt.events){
            topics.push(e.topics);
            if(e.topics[0]==ethers.utils.id("LiquidityProvided(address,uint256)"))
                event = e;
        }
        //console.log(topics);
        //console.log(event);
        //const {0: amountNOI, 1: amountDAI, 2: LPTokens} = txProvideLiq;

        //console.log("\n\n\n\n\n");
        //console.log(event.data.slice(26,66));//
        console.log("LP tokeni iz transakcije: " + parseInt(event.data.slice(66,133),16));
        const cockANDBALLZ = await pairContractObj.balanceOf(senderAccounts[1].address);
        console.log("LP Tokens according to contract: " + cockANDBALLZ.toString());
        let LPTokens = parseInt(event.data.slice(66,133),16);
        //console.log(txProvideLiq);

        // const txProvideLiq = await ExchangePoolContractObj.connect(senderAccounts[1]).provideLiquidity(10000, 10000);
        // await txProvideLiq.wait();

        console.log("proso liquidity provide ");

        /*pairAddress = await factoryContractObj.connect(senderAccounts[1]).getPair(noiContractObj.address, daiAddr);
        console.log(pairAddress);
        pairContractObj = await hre.ethers.getContractAt("IPool", pairAddress);
        console.log("add: " + pairContractObj.address);*/
      
        //const getPoolVals = await pairContractObj.getReserves();
        const getPoolVals = await exchangePoolContractObj.getReserves();
        const {0: noiAmount, 1: daiAmount, 2: timestampu} = getPoolVals;

        //console.log(getPoolVals);
        console.log("noi amounte after provide: " + noiAmount + ", dai amounte after provide: " + daiAmount);

        //________________________________

        const txApproveLP = await pairContractObj.connect(senderAccounts[1]).approve(exchangePoolContractObj.address,LPTokens);
        await txApproveLP.wait();
        const txRemoveLiq = await exchangePoolContractObj.connect(senderAccounts[1]).removeLiquidity(LPTokens);
        await txRemoveLiq.wait();

        const getPoolVals1 = await exchangePoolContractObj.getReserves();
        const {0: noiAmount1, 1: daiAmount1, 2: timestampu1} = getPoolVals1;
        //console.log("noi amounte after remove: " + noiAmount1);

        //assert.isAtLeast(noiAmount,10000,"Required liquidity[0] not in pool");
       // assert.isAtLeast(daiAmount,10000,"Required liquidity[1] not in pool");
       console.log("After remove, noi :" + noiAmount1 + ", dai :" + daiAmount1);
        assert(noiAmount1 == 1000 && daiAmount1 == 1000, "Test passed broooo lmao ez");
        //assert.equal("9999000000000000000000", receipt.toString());
    });

    // it('... provide liquidity by multiple addresses', async () => {     
    //     const txOpenCDP = [];
    //     const txMintFromCDPManager = [];
    //     const txAuthorizeRouter = [];
    //     const txGetDaiFromUniPool = [];
    //     const txProvideLiq = [];
    //     const getCDPIndex = [];
    //     const cdpIndex = [];

    //     for(let i = 0; i < 3; i++){
    //         console.log(i);
    //         txOpenCDP.push(await CDPManagerContractObj.connect(senderAccounts[i+1]).openCDP(senderAccounts[i+1].address, {value: ethers.utils.parseEther("12")}));
    //         //await txOpenCDP[i].wait();

    //         getCDPIndex.push(await CDPManagerContractObj.connect(senderAccounts[i+1]).cdpi());
    //         cdpIndex[i] = getCDPIndex[i].toString();

    //         txMintFromCDPManager.push(await CDPManagerContractObj.connect(senderAccounts[i+1]).mintFromCDP(cdpIndex[i], "1000000"));
    //         //await txMintFromCDPManager[i].wait();

    //         txAuthorizeRouter.push(await daiContractObj.connect(senderAccounts[i+1]).approve(routerContractObj.address, 1000000));
    //         //await txAuthorizeRouter[i].wait();

    //         const txGetDaiFromUniPool = await exchangePoolContractObj.connect(senderAccounts[i+1]).getDAI(1000000,{value: ethers.utils.parseEther("12")});
    //         //await txGetDaiFromUniPool.wait();

    //         const txApproveDaiRout = await daiContractObj.connect(senderAccounts[i+1]).approve(exchangePoolContractObj.address, 10000000);
    //         //await txApproveDaiRout.wait();
    //         const txApproveNoiRout = await noiContractObj.connect(senderAccounts[i+1]).approve(exchangePoolContractObj.address, 10000000);
    //         //await txApproveNoiRout.wait();

    //         txProvideLiq.push(await exchangePoolContractObj.connect(senderAccounts[i+1]).provideLiquidity(1000000, 1000000));
    //         //await txGetDaiFromUniPool[i].wait();
    //     }
        
    //     //get NOI  
    //     // const txOpenCDP1 = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
    //     // await txOpenCDP1.wait();
    //     // const txOpenCDP2 = await CDPManagerContractObj.connect(senderAccounts[2]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
    //     // await txOpenCDP2.wait();
    //     // const txOpenCDP3 = await CDPManagerContractObj.connect(senderAccounts[3]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
    //     // await txOpenCDP3.wait();
    //     // const txOpenCDP4 = await CDPManagerContractObj.connect(senderAccounts[4]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
    //     // await txOpenCDP4.wait();

    //     // //get DAI
    //     // const txAuthorizeRouter1 = await daiContractObj.connect(senderAccounts[1]).approve(RouterContractObj.address, 1000000);
    //     // await txAuthorizeRouter1.wait();
    //     // const txAuthorizeRouter2 = await daiContractObj.connect(senderAccounts[2]).approve(RouterContractObj.address, 1000000);
    //     // await txAuthorizeRouter2.wait();
    //     // const txAuthorizeRouter3 = await daiContractObj.connect(senderAccounts[3]).approve(RouterContractObj.address, 1000000);
    //     // await txAuthorizeRouter3.wait();
    //     // const txAuthorizeRouter4 = await daiContractObj.connect(senderAccounts[4]).approve(RouterContractObj.address, 1000000);
    //     // await txAuthorizeRouter4.wait();
        
    //     // //authorize Router
    //     // const txGetDaiFromUniPool1 = await ExchangePoolContractObj.connect(senderAccounts[1]).getDAI(1000000);
    //     // await txGetDaiFromUniPool1.wait();
    //     // const txGetDaiFromUniPool2 = await ExchangePoolContractObj.connect(senderAccounts[2]).getDAI(1000000);
    //     // await txGetDaiFromUniPool2.wait();
    //     // const txGetDaiFromUniPool3 = await ExchangePoolContractObj.connect(senderAccounts[2]).getDAI(1000000);
    //     // await txGetDaiFromUniPool3.wait();
    //     // const txGetDaiFromUniPool4 = await ExchangePoolContractObj.connect(senderAccounts[2]).getDAI(1000000);
    //     // await txGetDaiFromUniPool4.wait();

    //     // //provide Liquidity
    //     // const txProvideLiq1 = await ExchangePoolContractObj.connect(senderAccounts[1]).provideLiquidity(1000000, 1000000);
    //     // await txProvideLiq1.wait();
    //     // const txProvideLiq2 = ExchangePoolContractObj.connect(senderAccounts[2]).provideLiquidity(1000000, 1000000);
    //     // await txProvideLiq2.wait();
    //     // const txProvideLiq3 = ExchangePoolContractObj.connect(senderAccounts[3]).provideLiquidity(1000000, 1000000);
    //     // await txProvideLiq3.wait();
    //     // const txProvideLiq4 = ExchangePoolContractObj.connect(senderAccounts[4]).provideLiquidity(1000000, 1000000);
    //     // await txProvideLiq4.wait();

    //     const getPoolVals = await exchangePoolContractObj.getReserves();
    //     const {0: noiAmount, 1: daiAmount, 2: timestampu} = getPoolVals;

    //     //console.log(getPoolVals);
    //     console.log("noi amounte test 2: " + noiAmount);

    //     assert.isAtLeast(noiAmount,3000000,"Required liquidity[0] not in pool");
    //     assert.isAtLeast(daiAmount,3000000,"Required liquidity[1] not in pool");
    // });

    // /*it('... single provide & remove of liquid assets', async () => {        
    //     const txOpenCDP = await CDPManagerContractObj.connect(senderAccounts[1]).openCDP(senderAccounts[1].address, {value: ethers.utils.parseEther("12")});
    //     await txOpenCDP.wait();

    //     const txChangeRate = await RateSetterContractObj.connect(senderAccounts[0]).updateCDPManagerData();
    //     await txChangeRate.wait();

    //     await executeActionFromMSW(
    //         multiSigWallet,
    //         0,
    //         CDPManagerContractObj.address,
    //         "removeAuthorization",
    //         ["address"],
    //         [RateSetterContractObj.address]
    //     );

    //     await expect(RateSetterContractObj.connect(senderAccounts[0]).updateCDPManagerData()).to.be.reverted;
    // });*/
});

