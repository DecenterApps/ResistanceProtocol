const BigNumber = require('big-number');

async function openAndMintFromCDP(CDPManagerContractObj, account, collateral, debt){

    collateral = collateral.toString();
    debt = BigNumber(10).pow(18).mult(debt).toString();

    // const txOpenCDP = await CDPManagerContractObj.connect(account).openCDP(account.address, {value: ethers.utils.parseEther(collateral)});
    // await txOpenCDP.wait();
    // const getCDPIndex = await CDPManagerContractObj.connect(account).cdpi();
    // const cdpIndex = getCDPIndex.toString();

    // const txmintFromCDPManager = await CDPManagerContractObj.connect(account).mintFromCDP(cdpIndex, debt);
    // await txmintFromCDPManager.wait();
    
    const txOpenCDP = await CDPManagerContractObj.connect(account).openCDPandMint(account.address, debt,  {value: ethers.utils.parseEther(collateral)});
    await txOpenCDP.wait();

    const getCDPIndex = await CDPManagerContractObj.connect(account).cdpi();
    const cdpIndex = getCDPIndex.toString();


    return cdpIndex;
}

async function approveAndLiquidatePosition(LiquidatorContractObj,noiContractObj,cdpIndex, account,amount){

    const approveCDPManager = await noiContractObj.connect(account).approve(CDPManagerContractObj.address, BigNumber(10).pow(18).mult(amount).toString());
    await approveCDPManager.wait();

    const liquidateCDP = await LiquidatorContractObj.connect(account).liquidateCDP(cdpIndex);
    await liquidateCDP.wait();
}

async function repayToCDP(CDPManagerContractObj,noiContractObj,cdpIndex,account,amount){
    
    const txApprove = await noiContractObj.connect(account).approve(CDPManagerContractObj.address, BigNumber(10).pow(18).mult(amount).toString());
    await txApprove.wait();

    const txRepay = await CDPManagerContractObj.connect(account).repayToCDP(cdpIndex, BigNumber(10).pow(18).mult(amount).toString());
    return await txRepay.wait();

}

async function repayAndCloseCDP(CDPManagerContractObj,noiContractObj,cdpIndex,account){
    
    const totalDebt = await CDPManagerContractObj.connect(account).getDebtWithSF(cdpIndex);
    const sfps = await getSFperSecond(CDPManagerContractObj,cdpIndex);

    const txApprove = await noiContractObj.connect(account).approve(CDPManagerContractObj.address, (totalDebt + 2*sfps).toString());
    await txApprove.wait();

    return CDPManagerContractObj.connect(account).repayAndCloseCDP(cdpIndex);
}

async function getSFperSecond(CDPManagerContractObj, cdpIndex)
{
    const debt = await CDPManagerContractObj.getOnlyDebt(cdpIndex);
    const sfps = Math.ceil(debt * 2 / 3153600000);
    return sfps;
}

async function expectToFailWithError(transactionPromise, errorSignature){
    let receipt = await expect(transactionPromise).to.be.reverted;
    assert.equal(receipt['error'].data.data,ethers.utils.id(errorSignature).slice(0,10))
}

module.exports = {
    openAndMintFromCDP,
    approveAndLiquidatePosition,
    repayToCDP,
    repayAndCloseCDP,
    expectToFailWithError,
    getSFperSecond
}