const BigNumber = require('big-number');

async function openCDP_and_mintNOI(CDPManagerContractObj, account, collateral, debt){

    collateral = collateral.toString();
    debt = BigNumber(10).pow(18).mult(debt).toString();

    const txOpenCDP = await CDPManagerContractObj.connect(account).openCDP(account.address, {value: ethers.utils.parseEther(collateral)});
    await txOpenCDP.wait();
    const getCDPIndex = await CDPManagerContractObj.connect(account).cdpi();
    const cdpIndex = getCDPIndex.toString();

    const txmintFromCDPManager = await CDPManagerContractObj.connect(account).mintFromCDP(cdpIndex, debt);
    await txmintFromCDPManager.wait();

    return cdpIndex;
}

async function getDaiFromWethPool(DAIContractObj, RouterContractObj, ExchangePoolContractObj, account, amountDAI, amountETH){
    const txAuthorizeRouter = await DAIContractObj.connect(account).approve(RouterContractObj.address, amountDAI);
    await txAuthorizeRouter.wait();
        
    const txGetDaiFromUniPool = await ExchangePoolContractObj.connect(account).getDAI(amountDAI,{value: ethers.utils.parseEther(amountETH)});
    await txGetDaiFromUniPool.wait();
}

async function provideLiquidity(DAIContractObj, NOIContractObj, ExchangePoolContractObj, account, amountNOI, amountDAI){
    //give pool the allowance of amountNOI/amountDAI
    const txApproveNoiExPool = await NOIContractObj.connect(account).approve(ExchangePoolContractObj.address, amountNOI);
    await txApproveNoiExPool.wait();
    const txApproveDaiExPool = await DAIContractObj.connect(account).approve(ExchangePoolContractObj.address, amountDAI);
    await txApproveDaiExPool.wait();

    //provide liquidity to the exchange pool
    const txProvideLiq = await ExchangePoolContractObj.connect(account).provideLiquidity(amountNOI, amountDAI);

    const receipt = await txProvideLiq.wait(); 
    const topics = []
    let event;
    for(let e of receipt.events){
        topics.push(e.topics);
        if(e.topics[0]==ethers.utils.id("LiquidityProvided(address,uint256)"))
            event = e;
    }
    //returns the amount of LP Tokens received for the liquidity provision
    return parseInt(event.data.slice(66,133),16);
}

async function removeLiquidity(PairContractObj, ExchangePoolContractObj, account, amountLPTokens){
    const txApproveLP = await PairContractObj.connect(account).approve(ExchangePoolContractObj.address,amountLPTokens);
    await txApproveLP.wait();
    const txRemoveLiq = await ExchangePoolContractObj.connect(account).removeLiquidity(amountLPTokens);
    await txRemoveLiq.wait();
} 


module.exports = {
    openCDP_and_mintNOI,
    getDaiFromWethPool,
    provideLiquidity,
    removeLiquidity
}