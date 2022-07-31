const { ethers } = require("hardhat");

async function executeActionFromMSW(
    MultiSigWalletContract,
    ethAmount,
    contractAddress,
    functionSignature,
    functionArgTypes,
    functionArgValues
) {
    const signers = [];
    signers.push((await hre.ethers.getSigners())[0]);
    signers.push((await hre.ethers.getSigners())[1]);
    signers.push((await hre.ethers.getSigners())[2]);

    const actionIndx = (await MultiSigWalletContract.getTransactionCount()).toString();

    const submitAction = await MultiSigWalletContract.connect(signers[0]).submitTransaction(
        contractAddress,
        ethAmount,
        new ethers.utils.Interface([
            "function " + functionSignature + "(" + String(functionArgTypes) + ")",
        ]).encodeFunctionData(functionSignature, functionArgValues)
    );
    await submitAction.wait(1);

    // confirm for majority
    for (let i = 0; i <= signers.length / 2; i += 1) {
        const confirmAction = await MultiSigWalletContract.connect(signers[i]).confirmTransaction(
            actionIndx
        );
        await confirmAction.wait(1);
    }

    const executeAction = await MultiSigWalletContract.connect(signers[0]).executeTransaction(
        actionIndx
    );
    await executeAction.wait(1);
}

module.exports = { executeActionFromMSW };
