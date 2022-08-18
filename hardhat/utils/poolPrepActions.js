const BigNumber = require('big-number');
const { keccak256 } = require('ethers/lib/utils');

function normalize(value){
    return BigInt(value.toString()) / BigInt(BigNumber(10).pow(18).toString());
}

async function getNOI(CDPManagerContractObj, account, collateral, debt){

    collateral = collateral.toString();
    debt = BigNumber(10).pow(18).mult(debt).toString();
    
    const txOpenCDP = await CDPManagerContractObj.connect(account).openCDPandMint(account.address, debt,  {value: ethers.utils.parseEther(collateral)});
    await txOpenCDP.wait();

    const getCDPIndex = await CDPManagerContractObj.connect(account).cdpi();
    const cdpIndex = getCDPIndex.toString();

    return cdpIndex;
}

async function getDAI(DaiContractObj, RouterContractObj, account, amountETH, amountDAI, wethAddr){

    const tokenAddrs = [];
    tokenAddrs.push(wethAddr);
    tokenAddrs.push(DaiContractObj.address);

    amountDAI = BigNumber(10).pow(18).mult(amountDAI).toString();
    const MAX_UINT = BigNumber(2).pow(256).minus(1).toString();

    const buyDAI = await RouterContractObj.connect(account).swapETHForExactTokens(amountDAI, tokenAddrs, account.address, MAX_UINT, {value: ethers.utils.parseEther(amountETH.toString())});
    await buyDAI.wait();
}

async function provideLiquidity(DaiContractObj, NoiContractObj, ExchangePoolContractObj, account, amountNOI, amountDAI){

    amountDAI = BigNumber(10).pow(18).mult(amountDAI).toString();
    amountNOI = BigNumber(10).pow(18).mult(amountNOI).toString();
    
    const approvePoolNoi = await NoiContractObj.connect(account).approve(ExchangePoolContractObj.address, amountNOI);
    await approvePoolNoi.wait();
    
    const approvePoolDai = await DaiContractObj.connect(account).approve(ExchangePoolContractObj.address, amountDAI);
    await approvePoolDai.wait();

    let receipt = await ExchangePoolContractObj.connect(account).provideLiquidity(amountNOI, amountDAI);
    receipt = await receipt.wait();
    let retVals;
    for(let i of receipt.events){
        if(i.topics[0] == keccak256(ethers.utils.toUtf8Bytes("LiquidityProvided(address,uint256)"))) retVals = i.data;
    }
    let LPTokens = retVals.slice(66,130);
    return BigInt("0x" + LPTokens.toString()).toString(); 
}

async function removeLiquidity(PairContractObj, ExchangePoolContractObj, account, LPTokens){
    
    const approvePoolLP = await PairContractObj.connect(account).approve(ExchangePoolContractObj.address, LPTokens);
    await approvePoolLP.wait();
    
    const removal = await ExchangePoolContractObj.connect(account).removeLiquidity(LPTokens);
    await removal.wait();
}

async function swapNoiForDai(ExchangePoolContractObj, NoiContractObj, account, amountNOI){

    amountNOI = BigNumber(10).pow(18).mult(amountNOI).toString();
    
    const approvePoolNoi = await NoiContractObj.connect(account).approve(ExchangePoolContractObj.address, amountNOI);
    await approvePoolNoi.wait();

    const swap = await ExchangePoolContractObj.connect(account).exchangeNoiForDai(amountNOI);
    await swap.wait();
}

async function swapDaiForNoi(ExchangePoolContractObj, DaiContractObj, account, amountDAI){

    amountDAI = BigNumber(10).pow(18).mult(amountDAI).toString();
    
    const approvePoolDai = await DaiContractObj.connect(account).approve(ExchangePoolContractObj.address, amountDAI);
    await approvePoolDai.wait();

    const swap = await ExchangePoolContractObj.connect(account).exchangeDaiForNoi(amountDAI);
    await swap.wait();
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