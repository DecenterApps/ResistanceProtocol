const hre = require('hardhat');
const { assert, expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");

describe('ShutdownModule', function () {
    const senderAccounts = [];
    let owner;
    let CDPManagerContractObj;
    let deployer;
    let ShutdownModuleObj;
    let ParametersContractObj;

    beforeEach(async () => {
        snapshot = await takeSnapshot();
    });

    afterEach(async () => {
        await revertToSnapshot(snapshot);
    });

    before(async () => {
        deployer = (await getNamedAccounts()).deployer;

        ShutdownModuleObj = await ethers.getContract("ShutdownModule", deployer);
        ParametersContractObj = await ethers.getContract("Parameters", deployer);
        CDPManagerContractObj= await ethers.getContract("CDPManager", deployer);

        senderAccounts.push((await hre.ethers.getSigners())[1]);
        senderAccounts.push((await hre.ethers.getSigners())[2]);
        senderAccounts.push((await hre.ethers.getSigners())[3]);
        senderAccounts.push((await hre.ethers.getSigners())[4]);
    });

    it('... calculate global CR', async () => {        
        
        let txGlobalCR = await ShutdownModuleObj.connect(senderAccounts[0]).calculateGlobalCR();
        console.log(txGlobalCR.toString())

    });

    it('... global CR should change', async () => {        
        
        let oldGlobalCR = await ShutdownModuleObj.connect(senderAccounts[0]).calculateGlobalCR();
        const txOpen=await CDPManagerContractObj.connect(senderAccounts[0]).openCDPandMint(senderAccounts[0].address,1000,{value: ethers.utils.parseEther("2")});
        let newGlobalCR = await ShutdownModuleObj.connect(senderAccounts[0]).calculateGlobalCR();
        assert.notEqual(oldGlobalCR,newGlobalCR);

    });

    it('... start shutdown false', async () => {        
        
        let shutdown  = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
        const txGShutdown = await ShutdownModuleObj.connect(senderAccounts[0]).startShutdown();

        shutdown  = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
        assert.equal('false',shutdown.toString());

    });

    it('... start shutdown true', async () => {        
        
        let shutdown  = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
        const txParam= await ParametersContractObj.connect(senderAccounts[0]).setGlobalCRLimit(1100);
        const txGShutdown = await ShutdownModuleObj.connect(senderAccounts[0]).startShutdown();

        shutdown  = await ShutdownModuleObj.connect(senderAccounts[0]).shutdown();
        assert.equal('true',shutdown.toString());

    });
});