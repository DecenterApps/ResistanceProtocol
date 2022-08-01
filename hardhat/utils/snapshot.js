const hre = require("hardhat");

const takeSnapshot = async () =>
    hre.network.provider.request({
        method: "evm_snapshot",
    });

const revertToSnapshot = async (snapshotId) =>
    hre.network.provider.request({
        method: "evm_revert",
        params: [snapshotId],
    });

module.exports = { takeSnapshot, revertToSnapshot };
