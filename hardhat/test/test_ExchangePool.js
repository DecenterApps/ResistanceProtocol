const hre = require('hardhat');
const { assert } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");
const { ethers } = require('hardhat');
const { normalize, getNOI, getDAI, provideLiquidity, removeLiquidity, swapNoiForDai,swapDaiForNoi} = require("../utils/poolPrepActions");
const BigNumber = require('big-number');


describe('ExchangePool', function () {   
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

        factoryContractAddr = await routerContractObj.factory();
        factoryContractObj = await hre.ethers.getContractAt("IFactory", factoryContractAddr); 

        pairAddress = await factoryContractObj.connect(senderAccounts[1]).getPair(noiContractObj.address, daiContractObj.address);
        pairContractObj = await hre.ethers.getContractAt("IPool", pairAddress);
        
        wethAddr = await routerContractObj.WETH();
    });

    it('... single liquidity provider', async () => {      

        //Getting NOI and DAI
        await getNOI(CDPManagerContractObj, senderAccounts[1], 250, 100000);
        await getDAI(daiContractObj, routerContractObj, senderAccounts[1], 250, 100000, wethAddr);

        //Providing liquidity
        await provideLiquidity(daiContractObj, noiContractObj, exchangePoolContractObj, senderAccounts[1], 100000, 100000);

        const getPoolVals = await exchangePoolContractObj.getReserves();
        let {0: noiAmount, 1: daiAmount,} = getPoolVals;

        noiAmount = normalize(noiAmount);
        daiAmount = normalize(daiAmount);
 
        assert(noiAmount == 100000 && daiAmount == 100000, "Required liquidity not in pool");
    });

    it('... provide liquidity by multiple addresses', async () => {     
        for(let i = 0; i < 5; i++){
            await getNOI(CDPManagerContractObj, senderAccounts[i+1], 250, 100000);
            await getDAI(daiContractObj, routerContractObj, senderAccounts[i+1], 250, 100000, wethAddr);
            await provideLiquidity(daiContractObj, noiContractObj, exchangePoolContractObj, senderAccounts[i+1], 100000, 100000);
        }

        const getPoolVals = await exchangePoolContractObj.getReserves();
        let {0: noiAmount, 1: daiAmount,} = getPoolVals;
        noiAmount = normalize(noiAmount);
        daiAmount = normalize(daiAmount);

        assert(noiAmount == 500000 && daiAmount == 500000,"Required liquidity not in pool");
    });

    it('... single provision and removal of liquidity', async () => {        
        //Getting NOI and DAI
        await getNOI(CDPManagerContractObj, senderAccounts[1], 250, 100000);
        await getDAI(daiContractObj, routerContractObj, senderAccounts[1], 250, 100000, wethAddr);

        //Providing liquidity
        let LPTokens = await provideLiquidity(daiContractObj, noiContractObj, exchangePoolContractObj, senderAccounts[1], 100000, 100000);

        await removeLiquidity(pairContractObj, exchangePoolContractObj, senderAccounts[1], LPTokens);

        const getPoolVals = await exchangePoolContractObj.getReserves();
        const {0: noiAmount, 1: daiAmount,} = getPoolVals;

        assert(noiAmount == 1000 && daiAmount == 1000, "Required liquidity not in pool");
    });

    it('... two provisions, one remove', async () => {        
        //Getting NOI and DAI
        await getNOI(CDPManagerContractObj, senderAccounts[1], 250, 100000);
        await getDAI(daiContractObj, routerContractObj, senderAccounts[1], 250, 100000, wethAddr);
        await getNOI(CDPManagerContractObj, senderAccounts[2], 250, 100000);
        await getDAI(daiContractObj, routerContractObj, senderAccounts[2], 250, 100000, wethAddr);

        //Providing liquidity
        let LPTokens = await provideLiquidity(daiContractObj, noiContractObj, exchangePoolContractObj, senderAccounts[1], 100000, 100000);
        await provideLiquidity(daiContractObj, noiContractObj, exchangePoolContractObj, senderAccounts[2], 100000, 100000);

        await removeLiquidity(pairContractObj, exchangePoolContractObj, senderAccounts[1], LPTokens);

        const getPoolVals = await exchangePoolContractObj.getReserves();
        let {0: noiAmount, 1: daiAmount,} = getPoolVals;

        assert(noiAmount.toString() == "100000000000000000001000" && daiAmount.toString() == "100000000000000000001000", "Required liquidity not in pool");
    });

    it('... provision and exchange of NOI', async () => {        
        //Getting NOI and DAI
        await getNOI(CDPManagerContractObj, senderAccounts[1], 500, 200000);
        await getDAI(daiContractObj, routerContractObj, senderAccounts[1], 250, 100000, wethAddr);

        //Providing liquidity
        await provideLiquidity(daiContractObj, noiContractObj, exchangePoolContractObj, senderAccounts[1], 100000, 100000);
        //Swap
        await swapNoiForDai(exchangePoolContractObj, noiContractObj, senderAccounts[1], 1000);

        const getPoolVals = await exchangePoolContractObj.getReserves();
        let {0: noiAmount, 1: daiAmount,} = getPoolVals;
        noiAmount = normalize(noiAmount);
        daiAmount = normalize(daiAmount);
 
        assert(noiAmount < 100000 && daiAmount > 100000, "Required liquidity not in pool");
    });

    it('... provision and exchange of DAI', async () => {        
        //Getting NOI and DAI
        await getNOI(CDPManagerContractObj, senderAccounts[1], 250, 100000);
        await getDAI(daiContractObj, routerContractObj, senderAccounts[1], 500, 200000, wethAddr);

        //Providing liquidity
        await provideLiquidity(daiContractObj, noiContractObj, exchangePoolContractObj, senderAccounts[1], 100000, 100000);

        //Swap
        await swapDaiForNoi(exchangePoolContractObj, daiContractObj, senderAccounts[1], 1000);

        const getPoolVals = await exchangePoolContractObj.getReserves();
        let {0: noiAmount, 1: daiAmount,} = getPoolVals;
        noiAmount = normalize(noiAmount);
        daiAmount = normalize(daiAmount);
 
        assert(noiAmount > 100000 && daiAmount < 100000, "Required liquidity not in pool");
    });

    it('... withdrawal of liquidity after external swaps', async () => {        
        //Getting NOI and DAI
        await getNOI(CDPManagerContractObj, senderAccounts[1], 2500, 1000000);
        await getDAI(daiContractObj, routerContractObj, senderAccounts[1], 2500, 1000000, wethAddr);
        await getNOI(CDPManagerContractObj, senderAccounts[2], 2500, 100000);
        await getDAI(daiContractObj, routerContractObj, senderAccounts[3], 2500, 100000, wethAddr);
        await getNOI(CDPManagerContractObj, senderAccounts[3], 2500, 100000);
        await getDAI(daiContractObj, routerContractObj, senderAccounts[2], 2500, 100000, wethAddr);

        //Providing liquidity
        const LPTokens = await provideLiquidity(daiContractObj, noiContractObj, exchangePoolContractObj, senderAccounts[1], 1000000, 1000000);
        
        //Swap
        await swapNoiForDai(exchangePoolContractObj, noiContractObj, senderAccounts[2], 100000);
        await swapDaiForNoi(exchangePoolContractObj, daiContractObj, senderAccounts[3], 100000);
        await swapNoiForDai(exchangePoolContractObj, noiContractObj, senderAccounts[3], 100000);
        await swapDaiForNoi(exchangePoolContractObj, daiContractObj, senderAccounts[2], 100000);

        const getPoolValsPreRemove = await exchangePoolContractObj.getReserves();
        const {0: noiAmountPreRemove, 1: daiAmountPreRemove,} = getPoolValsPreRemove;

        //removal
        await removeLiquidity(pairContractObj,exchangePoolContractObj,senderAccounts[1],LPTokens);
        const getPoolVals = await exchangePoolContractObj.getReserves();
        const {0: noiAmount, 1: daiAmount,} = getPoolVals;

        const liquidityRemovedFromPool = BigNumber(noiAmountPreRemove.toString()).minus(BigNumber(noiAmount.toString())).plus(BigNumber(daiAmountPreRemove.toString())).minus(BigNumber(daiAmount.toString()));
        const liquidityRemovableWithoutSwaps = BigNumber(10).pow(18).mult(1998000);
        assert(liquidityRemovedFromPool > liquidityRemovableWithoutSwaps , "Balance after removal isn't greater then when providing liquidity");
    });
});

