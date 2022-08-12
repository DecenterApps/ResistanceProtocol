const BigNumber = require('big-number');

function normalize(amount){
    return BigInt(amount.toString()) / (BigInt((BigNumber(10).pow(18)).toString()));
}

async function getNOI(CDPManagerContractObj, account, collateral, debt){

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

async function getDAI(DAIContractObj, RouterContractObj, account, amountETH, amountDAI, wethAddr){
    const tokenAddrs = [wethAddr, DAIContractObj.address];
    const txGetDaiFromUniPool = await RouterContractObj.connect(account).swapETHForExactTokens(
        new BigNumber(10).pow(18).mult(amountDAI).toString(), tokenAddrs, account.address, new BigNumber(2).pow(256).minus(1).toString(),{value: ethers.utils.parseEther(amountETH.toString())}
    );
    await txGetDaiFromUniPool.wait();
}

async function provideLiquidity(DAIContractObj, NOIContractObj, ExchangePoolContractObj, account, amountNOI, amountDAI){
    amountDAI = new BigNumber(10).pow(18).mult(amountDAI).toString();
    amountNOI = new BigNumber(10).pow(18).mult(amountNOI).toString();
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
    return BigInt("0x" + event.data.slice(66,130));
}

async function removeLiquidity(PairContractObj, ExchangePoolContractObj, account, amountLPTokens){
    const txApproveLP = await PairContractObj.connect(account).approve(ExchangePoolContractObj.address,amountLPTokens);
    await txApproveLP.wait();
    const txRemoveLiq = await ExchangePoolContractObj.connect(account).removeLiquidity(amountLPTokens);
    await txRemoveLiq.wait();
} 

async function swapNoiForDai(ExchangePoolContractObj, NOIContractObj, account, noiAmount){
    noiAmount = BigNumber(10).pow(18).mult(noiAmount).toString();

    const txApproveNOI = await NOIContractObj.connect(account).approve(ExchangePoolContractObj.address,noiAmount);
    await txApproveNOI.wait();
    
    const txSwap = await ExchangePoolContractObj.connect(account).exchangeNoiForDai(noiAmount);
    await txSwap.wait();
}

async function swapDaiForNoi(ExchangePoolContractObj, DAIContractObj, account, daiAmount){
    daiAmount = BigNumber(10).pow(18).mult(daiAmount).toString();

    const txApproveNOI = await DAIContractObj.connect(account).approve(ExchangePoolContractObj.address,daiAmount);
    await txApproveNOI.wait();

    const txSwap = await ExchangePoolContractObj.connect(account).exchangeDaiForNoi(daiAmount);
    await txSwap.wait();
}

module.exports = {
    normalize,
    getNOI,
    getDAI,
    provideLiquidity,
    removeLiquidity,
    swapNoiForDai,
    swapDaiForNoi
}