const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("MultiSigWallet", function () {

    const senderAccounts = [];
    let owner;
    let multiSigWallet;
    let deployer;

    before(async () => {
        deployer = (await getNamedAccounts()).deployer;

        await deployments.fixture(["all"]);

        multiSigWallet = await ethers.getContract("MultiSigWallet", deployer);

        owner = (await hre.ethers.getSigners())[0];

        senderAccounts.push((await hre.ethers.getSigners())[1]);
        senderAccounts.push((await hre.ethers.getSigners())[2]);
        senderAccounts.push((await hre.ethers.getSigners())[3]);
        senderAccounts.push((await hre.ethers.getSigners())[4]);
    });

    it("... submit new tx from valid owner", async () => {
        const numberOfExistingPendingTxs = (await multiSigWallet.connect(senderAccounts[0]).getTransactionCount()).toString();
        const tx = await multiSigWallet.connect(senderAccounts[0]).submitTransaction(multiSigWallet.address, "0", ethers.utils.formatBytes32String(""));
        await tx.wait();
        const newNumberOfExistingPendingTxs = (await multiSigWallet.connect(senderAccounts[0]).getTransactionCount()).toString();
        assert.equal(Number(numberOfExistingPendingTxs) + 1, Number(newNumberOfExistingPendingTxs));
    });

    it("... submit new tx from invalid owner", async () => {
        await expect(multiSigWallet.connect(senderAccounts[3]).submitTransaction(multiSigWallet.address, "0", ethers.utils.formatBytes32String(""))).to.be
            .reverted;
    });

    it("... confirm pending tx", async () => {
        const tx = await multiSigWallet.connect(senderAccounts[0]).submitTransaction(multiSigWallet.address, "0", ethers.utils.formatBytes32String(""));
        await tx.wait();
        const pendingTxId = Number((await multiSigWallet.connect(senderAccounts[0]).getTransactionCount()).toString()) - 1;

        const txConfirmTx = await multiSigWallet.connect(senderAccounts[0]).confirmTransaction(pendingTxId);
        await txConfirmTx.wait();

        const pendingTxResult = await multiSigWallet.connect(senderAccounts[0]).transactions(pendingTxId);

        assert.equal(pendingTxResult[4].toString(), "1");
    });

    it("... revoke pending tx", async () => {
        const tx = await multiSigWallet.connect(senderAccounts[0]).submitTransaction(multiSigWallet.address, "0", ethers.utils.formatBytes32String(""));
        await tx.wait();
        const pendingTxId = Number((await multiSigWallet.connect(senderAccounts[0]).getTransactionCount()).toString()) - 1;

        const txConfirmTx = await multiSigWallet.connect(senderAccounts[0]).confirmTransaction(pendingTxId);
        await txConfirmTx.wait();

        const txRevokeTx = await multiSigWallet.connect(senderAccounts[0]).revokeConfirmation(pendingTxId);
        await txRevokeTx.wait();

        const pendingTxResult = await multiSigWallet.connect(senderAccounts[0]).transactions(pendingTxId);

        assert.equal(pendingTxResult[4].toString(), "0");
    });

    it("... execute pending send tx that is confirmed by majority", async () => {
        const oneEth = ethers.utils.parseEther("1");
        const oldAccBalance = (await senderAccounts[3].getBalance()).toString();

        const tx = await multiSigWallet.connect(senderAccounts[0]).submitTransaction(senderAccounts[3].address, oneEth, ethers.utils.formatBytes32String(""));
        await tx.wait();
        const txSendEth = await senderAccounts[0].sendTransaction({ to: multiSigWallet.address, value: ethers.utils.parseEther("10") });
        await txSendEth.wait();

        const pendingTxId = Number((await multiSigWallet.connect(senderAccounts[0]).getTransactionCount()).toString()) - 1;

        const txConfirm1Tx = await multiSigWallet.connect(senderAccounts[0]).confirmTransaction(pendingTxId);
        await txConfirm1Tx.wait();
        const txConfirm2Tx = await multiSigWallet.connect(senderAccounts[1]).confirmTransaction(pendingTxId);
        await txConfirm2Tx.wait();

        const txExecute = await multiSigWallet.connect(senderAccounts[0]).executeTransaction(pendingTxId);
        await txExecute.wait();

        const newAccBalance = (await senderAccounts[3].getBalance()).toString();

        assert.equal(Number(oldAccBalance) + Number(oneEth.toString()), Number(newAccBalance));
    });

    it("... execute pending send tx that is not confirmed by majority", async () => {
        const oneEth = ethers.utils.parseEther("1");
        const tx = await multiSigWallet.connect(senderAccounts[0]).submitTransaction(senderAccounts[3].address, oneEth, ethers.utils.formatBytes32String(""));
        await tx.wait();

        const pendingTxId = Number((await multiSigWallet.connect(senderAccounts[0]).getTransactionCount()).toString()) - 1;

        const txConfirm1Tx = await multiSigWallet.connect(senderAccounts[0]).confirmTransaction(pendingTxId);
        await txConfirm1Tx.wait();

        await expect(multiSigWallet.connect(senderAccounts[0]).executeTransaction(pendingTxId)).to.be.reverted;
    });
});
