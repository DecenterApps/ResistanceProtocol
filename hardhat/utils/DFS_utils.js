const { default: curve } = require('@curvefi/api');
const hre = require('hardhat');
const fs = require('fs');
const storageSlots = require('./storageSlots.json');

const { deployAsOwner } = require('../scripts/utils/deployer');

const strategyStorageBytecode = require('../artifacts/contracts/core/strategy/StrategyStorage.sol/StrategyStorage.json').deployedBytecode;
const subStorageBytecode = require('../artifacts/contracts/core/strategy/SubStorage.sol/SubStorage.json').deployedBytecode;
const bundleStorageBytecode = require('../artifacts/contracts/core/strategy/BundleStorage.sol/BundleStorage.json').deployedBytecode;
const recipeExecutorBytecode = require('../artifacts/contracts/core/RecipeExecutor.sol/RecipeExecutor.json').deployedBytecode;
const proxyAuthBytecode = require('../artifacts/contracts/core/strategy/ProxyAuth.sol/ProxyAuth.json').deployedBytecode;

const addrs = {
    mainnet: {
        PROXY_REGISTRY: '0x4678f0a6958e4D2Bc4F1BAF7Bc52E8F3564f3fE4',
        REGISTRY_ADDR: '0x287778F121F134C66212FB16c9b53eC991D32f5b',
        PROXY_AUTH_ADDR: '0x149667b6FAe2c63D1B4317C716b0D0e4d3E2bD70',
        OWNER_ACC: '0xBc841B0dE0b93205e912CFBBd1D0c160A1ec6F00',
        WETH_ADDRESS: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        DAI_ADDRESS: '0x6b175474e89094c44da98b954eedeac495271d0f',
        TOKEN_GROUP_REGISTRY: '0xcA49e64FE1FE8be40ED30F682edA1b27a6c8611c',
        FEE_RECEIVER: '0x6467e807dB1E71B9Ef04E0E3aFb962E4B0900B2B',
        USDC_ADDR: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        EXCHANGE_OWNER_ADDR: '0xBc841B0dE0b93205e912CFBBd1D0c160A1ec6F00',
        SAVER_EXCHANGE_ADDR: '0x25dd3F51e0C3c3Ff164DDC02A8E4D65Bb9cBB12D',
    },
    optimism: {
        PROXY_REGISTRY: '0x283Cc5C26e53D66ed2Ea252D986F094B37E6e895',
        REGISTRY_ADDR: '0xAf707Ee480204Ed6e2640B53cE86F680D28Afcbd',
        OWNER_ACC: '0x322d58b9E75a6918f7e7849AEe0fF09369977e08',
        WETH_ADDRESS: '0x4200000000000000000000000000000000000006',
        DAI_ADDRESS: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
        USDC_ADDR: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
        EXCHANGE_OWNER_ADDR: '0x322d58b9E75a6918f7e7849AEe0fF09369977e08',
        SAVER_EXCHANGE_ADDR: '0x36Bf2251E9797df071A9b8bc4dE58F7cAcc16F44',
    },
    kovan: {
        PROXY_REGISTRY: '0xF9722E05B68E5ad5D6E1674C4d6BfE11791a1E33',
    },
    kovanOptimism: {
        PROXY_REGISTRY: '0x1fA11C699629E43005fd64f4DA36d9Eb30333ef9',
    },
};

const REGISTRY_ADDR = '0x287778F121F134C66212FB16c9b53eC991D32f5b';
//require('dotenv-safe').config();

const config = require('../hardhat.config');

const nullAddress = '0x0000000000000000000000000000000000000000';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const KYBER_WRAPPER = '0x71C8dc1d6315a48850E88530d18d3a97505d2065';
const UNISWAP_WRAPPER = '0x6cb48F0525997c2C1594c89e0Ca74716C99E3d54';
const OASIS_WRAPPER = '0x2aD7D86C56b7a09742213e1e649C727cB4991A54';
const ETH_ADDR = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const DAI_ADDR = '0x6b175474e89094c44da98b954eedeac495271d0f';
const USDC_ADDR = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const RAI_ADDR = '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919';
const BAL_ADDR = '0xba100000625a3754423978a60c9317c58a424e3D';
const LOGGER_ADDR = '0xcE7a977Cac4a481bc84AC06b2Da0df614e621cf3';
const UNIV3ROUTER_ADDR = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const UNIV3POSITIONMANAGER_ADDR = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
const AAVE_MARKET = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5';
const YEARN_REGISTRY_ADDRESS = '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804';
const STETH_ADDRESS = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
const WSTETH_ADDRESS = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
const UNIV2_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const FEED_REGISTRY_ADDRESS = '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf';
const USD_DENOMINATION = '0x0000000000000000000000000000000000000348';

// optimism aave V3
const AAVE_MARKET_OPTIMISM = '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb';

// Dfs sdk won't accept 0x0 and we need some rand addr for testing
const placeHolderAddr = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF';
const AUNI_ADDR = '0xb9d7cb55f463405cdfbe4e90a6d2df01c2b92bf1';
const AWETH_ADDR = '0x030ba81f1c18d280636f32af80b9aad02cf0854e';
const AWBTC_ADDR = '0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656';
const ALINK_ADDR = '0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0';
const ADAI_ADDR = '0x028171bca77440897b824ca71d1c56cac55b68a3';
const UNI_ADDR = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const LINK_ADDR = '0x514910771af9ca656af840dff83e8264ecf986ca';
const WBTC_ADDR = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
const LUSD_ADDR = '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0';

const USDT_ADDR = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const BUSD_ADDR = '0x4fabb145d64652a948d72533023f6e7a623c7c53';

const OWNER_ACC = '0xBc841B0dE0b93205e912CFBBd1D0c160A1ec6F00';
const ADMIN_ACC = '0x25eFA336886C74eA8E282ac466BdCd0199f85BB9';

const rariDaiFundManager = '0xB465BAF04C087Ce3ed1C266F96CA43f4847D9635';
const rdptAddress = '0x0833cfcb11A5ba89FbAF73a407831c98aD2D7648';

const rariUsdcFundManager = '0xC6BF8C8A55f77686720E0a88e2Fd1fEEF58ddf4a';
const rsptAddress = '0x016bf078ABcaCB987f0589a6d3BEAdD4316922B0';

const MAX_UINT = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
const MAX_UINT128 = '340282366920938463463374607431768211455';

const DFS_REG_CONTROLLER = '0xF8f8B3C98Cf2E63Df3041b73f80F362a4cf3A576';

const dydxTokens = ['WETH', 'USDC', 'DAI'];

const network = hre.network.config.name;

const AAVE_FL_FEE = 0.09; // TODO: can we fetch this dynamically
const MIN_VAULT_DAI_AMOUNT = '45010'; // TODO: can we fetch this dynamically
const MIN_VAULT_RAI_AMOUNT = '3000'; // TODO: can we fetch this dynamically

const AVG_GAS_PRICE = 100; // gwei

const standardAmounts = {
    ETH: '4',
    WETH: '4',
    AAVE: '15',
    BAT: '8000',
    USDC: '8000',
    UNI: '100',
    SUSD: '8000',
    BUSD: '8000',
    SNX: '200',
    REP: '150',
    REN: '2000',
    MKR: '3',
    ENJ: '2000',
    DAI: '8000',
    WBTC: '0.15',
    RENBTC: '0.08',
    ZRX: '4000',
    KNC: '2000',
    MANA: '4000',
    PAXUSD: '8000',
    COMP: '10',
    LRC: '6000',
    LINK: '140',
    USDT: '4000',
    TUSD: '4000',
    BAL: '100',
    GUSD: '4000',
    YFI: '0.1',
};

const coinGeckoHelper = {
    ETH: 'ethereum',
    WETH: 'weth',
    AAVE: 'aave',
    BAT: 'basic-attention-token',
    USDC: 'usd-coin',
    UNI: 'uniswap',
    SUSD: 'nusd',
    BUSD: 'binance-usd',
    SNX: 'havven',
    REP: 'augur',
    REN: 'republic-protocol',
    MKR: 'maker',
    ENJ: 'enjincoin',
    DAI: 'dai',
    WBTC: 'wrapped-bitcoin',
    RENBTC: 'renbtc',
    ZRX: '0x',
    KNCL: 'kyber-network',
    MANA: 'decentraland',
    PAXUSD: 'paxos-standard',
    COMP: 'compound-governance-token',
    LRC: 'loopring',
    LINK: 'chainlink',
    USDT: 'tether',
    TUSD: 'true-usd',
    BAL: 'balancer',
    GUSD: 'gemini-dollar',
    YFI: 'yearn-finance',
    LUSD: 'liquity-usd',
    LQTY: 'liquity',
    TORN: 'tornado-cash',
    mUSD: 'musd',
    imUSD: 'imusd',
    RAI: 'rai',
    MATIC: 'matic-network',
    SUSHI: 'sushi',
};

/*const getOwnerAddr = () => addrs[network].OWNER_ACC;*/

async function findBalancesSlot(tokenAddress) {
    const slotObj = storageSlots[tokenAddress];
    if (slotObj) {
        return { isVyper: slotObj.isVyper, num: slotObj.num };
    }

    const encode = (types, values) => hre.ethers.utils.defaultAbiCoder.encode(types, values);
    const account = hre.ethers.constants.AddressZero;
    const probeA = encode(['uint'], [1]);
    const probeB = encode(['uint'], [2]);
    const token = await hre.ethers.getContractAt(
        'IERC20',
        tokenAddress,
    );
    for (let i = 0; i < 100; i++) {
        {
            let probedSlot = hre.ethers.utils.keccak256(
                encode(['address', 'uint'], [account, i]),
            );
            // remove padding for JSON RPC
            while (probedSlot.startsWith('0x0')) { probedSlot = `0x${probedSlot.slice(3)}`; }
            const prev = await hre.ethers.provider.send(
                'eth_getStorageAt',
                [tokenAddress, probedSlot, 'latest'],
            );
            // make sure the probe will change the slot value
            const probe = prev === probeA ? probeB : probeA;

            await hre.ethers.provider.send('hardhat_setStorageAt', [
                tokenAddress,
                probedSlot,
                probe,
            ]);

            const balance = await token.balanceOf(account);
            // reset to previous value
            await hre.ethers.provider.send('hardhat_setStorageAt', [
                tokenAddress,
                probedSlot,
                prev,
            ]);
            if (balance.eq(hre.ethers.BigNumber.from(probe))) {
                const result = { isVyper: false, num: i };
                storageSlots[tokenAddress] = result;
                // file path needs to be from top level folder
                fs.writeFileSync('test/storageSlots.json', JSON.stringify(storageSlots));
                return result;
            }
        }
        {
            let probedSlot = hre.ethers.utils.keccak256(
                encode(['uint', 'address'], [i, account]),
            );
            // remove padding for JSON RPC
            while (probedSlot.startsWith('0x0')) { probedSlot = `0x${probedSlot.slice(3)}`; }
            const prev = await hre.ethers.provider.send(
                'eth_getStorageAt',
                [tokenAddress, probedSlot, 'latest'],
            );
            // make sure the probe will change the slot value
            const probe = prev === probeA ? probeB : probeA;

            await hre.ethers.provider.send('hardhat_setStorageAt', [
                tokenAddress,
                probedSlot,
                probe,
            ]);

            const balance = await token.balanceOf(account);
            // reset to previous value
            await hre.ethers.provider.send('hardhat_setStorageAt', [
                tokenAddress,
                probedSlot,
                prev,
            ]);
            if (balance.eq(hre.ethers.BigNumber.from(probe))) {
                const result = { isVyper: true, num: i };
                storageSlots[tokenAddress] = result;
                // file path needs to be from top level folder
                fs.writeFileSync('test/storageSlots.json', JSON.stringify(storageSlots));
                return result;
            }
        }
    }
    console.log('Balance slot not found');
    return 0;
}

const toBytes32 = (bn) => hre.ethers.utils.hexlify(hre.ethers.utils.zeroPad(bn.toHexString(), 32));

const timeTravel = async (timeIncrease) => {
    await hre.network.provider.request({
        method: 'evm_increaseTime',
        params: [timeIncrease],
        id: (await hre.ethers.provider.getBlock('latest')).timestamp,
    });
};

const setStorageAt = async (address, index, value) => {
    await hre.ethers.provider.send('hardhat_setStorageAt', [address, index, value]);
    await hre.ethers.provider.send('evm_mine', []); // Just mines to the next block
};

const mineBlock = async () => {
    await hre.ethers.provider.send('evm_mine', []); // Just mines to the next block
};

const setBalance = async (tokenAddr, userAddr, value) => {
    try {
        let tokenContract = await hre.ethers.getContractAt('IProxyERC20', tokenAddr);
        const newTokenAddr = await tokenContract.callStatic.target();

        tokenContract = await hre.ethers.getContractAt('IProxyERC20', newTokenAddr);
        const tokenState = await tokenContract.callStatic.tokenState();
        // eslint-disable-next-line no-param-reassign
        tokenAddr = tokenState;
    // eslint-disable-next-line no-empty
    } catch (error) {
    }
    const slotInfo = await findBalancesSlot(tokenAddr);
    let index;
    if (slotInfo.isVyper) {
        index = hre.ethers.utils.solidityKeccak256(
            ['uint256', 'uint256'],
            [slotInfo.num, userAddr], // key, slot
        );
    } else {
        index = hre.ethers.utils.solidityKeccak256(
            ['uint256', 'uint256'],
            [userAddr, slotInfo.num], // key, slot
        );
    }
    while (index.startsWith('0x0')) { index = `0x${index.slice(3)}`; }

    await setStorageAt(
        tokenAddr,
        index.toString(),
        toBytes32(value).toString(),
    );
};

const fetchAmountinUSDPrice = (tokenSign, amountUSD) => {
    const data = JSON.parse(fs.readFileSync('test/prices.json', 'utf8'));
    const tokenNames = Object.keys(data);
    for (let i = 0; i < tokenNames.length; i++) {
        if (tokenNames[i] === coinGeckoHelper[tokenSign]) {
            const amountNumber = (amountUSD / data[tokenNames[i]].usd);
            return amountNumber.toFixed(2);
        }
    }
    return 0;
};

const getLocalTokenPrice = (tokenSymbol) => {
    const data = JSON.parse(fs.readFileSync('test/prices.json', 'utf8'));
    const tokenNames = Object.keys(data);
    for (let i = 0; i < tokenNames.length; i++) {
        if (tokenNames[i] === coinGeckoHelper[tokenSymbol]) {
            return data[tokenNames[i]].usd;
        }
    }
    return 0;
};

const fetchStandardAmounts = async () => standardAmounts;

const impersonateAccount = async (account) => {
    await hre.network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [account],
    });
};

const stopImpersonatingAccount = async (account) => {
    await hre.network.provider.request({
        method: 'hardhat_stopImpersonatingAccount',
        params: [account],
    });
};

const getNameId = (name) => {
    const hash = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes(name));

    return hash.substr(0, 10);
};

const getAddrFromRegistry = async (name, regAddr = addrs[network].REGISTRY_ADDR) => {
    const registryInstance = await hre.ethers.getContractFactory('DFSRegistry');
    const registry = await registryInstance.attach(regAddr);

    // TODO: Write in registry later
    if (name === 'StrategyProxy') {
        return '0x0822902D30CC9c77404e6eB140dC1E98aF5b559A';
    } if (name === 'SubProxy') {
        return '0xd18d4756bbf848674cc35f1a0B86afEF20787382';
    }
    const addr = await registry.getAddr(
        getNameId(name),
    );
    return addr;
};

const getProxyWithSigner = async (signer, addr) => {
    const proxyRegistry = await
    hre.ethers.getContractAt('IProxyRegistry', addrs[network].PROXY_REGISTRY);

    let proxyAddr = await proxyRegistry.proxies(addr);

    if (proxyAddr === nullAddress) {
        await proxyRegistry.build(addr);
        proxyAddr = await proxyRegistry.proxies(addr);
    }

    const dsProxy = await hre.ethers.getContractAt('IDSProxy', proxyAddr, signer);

    return dsProxy;
};

const getProxy = async (acc) => {
    const proxyRegistry = await
    hre.ethers.getContractAt('IProxyRegistry', addrs[network].PROXY_REGISTRY);
    let proxyAddr = await proxyRegistry.proxies(acc);

    if (proxyAddr === nullAddress) {
        await proxyRegistry.build(acc);
        proxyAddr = await proxyRegistry.proxies(acc);
    }

    const dsProxy = await hre.ethers.getContractAt('IDSProxy', proxyAddr);

    return dsProxy;
};

const sendEther = async (signer, toAddress, amount) => {
    const valueAmount = hre.ethers.utils.parseUnits(amount, 18);
    await signer.sendTransaction({
        to: toAddress,
        value: valueAmount,
    });
};

// eslint-disable-next-line max-len
const redeploy = async (name, regAddr = addrs[network].REGISTRY_ADDR, saveOnTenderly = config.saveOnTenderly) => {
    await hre.network.provider.send('hardhat_setBalance', [
        getOwnerAddr(),
        '0xC9F2C9CD04674EDEA40000000',
    ]);
    await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x1', // 1 wei
    ]);
    if (regAddr === addrs[network].REGISTRY_ADDR) {
        await impersonateAccount(getOwnerAddr());
    }

    const signer = await hre.ethers.provider.getSigner(getOwnerAddr());
    const ethSender = (await hre.ethers.getSigners())[0];
    await sendEther(ethSender, getOwnerAddr(), '100');
    const registryInstance = await hre.ethers.getContractFactory('DFSRegistry', signer);
    let registry = await registryInstance.attach(regAddr);

    registry = registry.connect(signer);

    const c = await deployAsOwner(name);

    if (name === 'StrategyExecutor') {
        // eslint-disable-next-line no-param-reassign
        name = 'StrategyExecutorID';
    }

    const id = getNameId(name);

    if (!(await registry.isRegistered(id))) {
        await registry.addNewContract(id, c.address, 0, { gasLimit: 2000000 });
    } else {
        await registry.startContractChange(id, c.address, { gasLimit: 2000000 });

        const entryData = await registry.entries(id);

        if (parseInt(entryData.waitPeriod, 10) > 0) {
            await timeTravel(parseInt(entryData.waitPeriod, 10) + 10);
        }

        await registry.approveContractChange(id, { gasLimit: 2000000 });
    }

    // for strategy deployment set open to public for easier testing
    if (name === 'StrategyStorage' || name === 'BundleStorage') {
        const storageContract = c.connect(signer);
        await storageContract.changeEditPermission(true);
    }

    if (hre.network.config.type !== 'tenderly') {
        if (regAddr === addrs[network].REGISTRY_ADDR) {
            await stopImpersonatingAccount(getOwnerAddr());
        }
    }

    if (saveOnTenderly) {
        await hre.tenderly.persistArtifacts({
            name,
            address: c.address,
        });
    }

    return c;
};

const setCode = async (addr, code) => {
    await hre.network.provider.send('hardhat_setCode', [addr, code]);
};

const redeployCore = async () => {
    const strategyStorageAddr = await getAddrFromRegistry('StrategyStorage', addrs[network].REGISTRY_ADDR);
    await setCode(strategyStorageAddr, strategyStorageBytecode);

    const subStorageAddr = await getAddrFromRegistry('SubStorage', addrs[network].REGISTRY_ADDR);
    await setCode(subStorageAddr, subStorageBytecode);

    const bundleStorageAddr = await getAddrFromRegistry('BundleStorage', addrs[network].REGISTRY_ADDR);
    await setCode(bundleStorageAddr, bundleStorageBytecode);

    const recipeExecutorAddr = await getAddrFromRegistry('RecipeExecutor', addrs[network].REGISTRY_ADDR);
    await setCode(recipeExecutorAddr, recipeExecutorBytecode);

    await setCode(addrs[network].PROXY_AUTH_ADDR, proxyAuthBytecode);

    await redeploy('SubProxy', addrs[network].REGISTRY_ADDR);
    await redeploy('StrategyProxy', addrs[network].REGISTRY_ADDR);
    const strategyExecutor = await redeploy('StrategyExecutor', addrs[network].REGISTRY_ADDR);

    return strategyExecutor;
};

const send = async (tokenAddr, to, amount) => {
    const tokenContract = await hre.ethers.getContractAt('IERC20', tokenAddr);

    await tokenContract.transfer(to, amount);
};

const approve = async (tokenAddr, to, signer) => {
    const tokenContract = await hre.ethers.getContractAt('IERC20', tokenAddr);

    const from = signer ? signer.address : tokenContract.signer.address;

    const allowance = await tokenContract.allowance(from, to);

    if (allowance.toString() === '0') {
        if (signer) {
            const tokenContractSigner = tokenContract.connect(signer);
            // eslint-disable-next-line max-len
            await tokenContractSigner.approve(to, hre.ethers.constants.MaxUint256, { gasLimit: 1000000 });
        } else {
            await tokenContract.approve(to, hre.ethers.constants.MaxUint256, { gasLimit: 1000000 });
        }
    }
};

const getAllowance = async (tokenAddr, from, to) => {
    const tokenContract = await hre.ethers.getContractAt('IERC20', tokenAddr);

    const allowance = await tokenContract.allowance(from, to);

    return allowance;
};

const balanceOf = async (tokenAddr, addr) => {
    const tokenContract = await hre.ethers.getContractAt('IERC20', tokenAddr);
    let balance = '';

    if (tokenAddr.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        balance = await hre.ethers.provider.getBalance(addr);
    } else {
        balance = await tokenContract.balanceOf(addr);
    }
    return balance;
};
const balanceOfOnTokenInBlock = async (tokenAddr, addr, block) => {
    const tokenContract = await hre.ethers.getContractAt('IERC20', tokenAddr);
    let balance = '';
    balance = await tokenContract.balanceOf(addr, { blockTag: block });
    return balance;
};

const formatExchangeObj = (srcAddr, destAddr, amount, wrapper, destAmount = 0, uniV3fee) => {
    const abiCoder = new hre.ethers.utils.AbiCoder();

    let firstPath = srcAddr;
    let secondPath = destAddr;

    if (srcAddr.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        firstPath = addrs[network].WETH_ADDRESS;
    }

    if (destAddr.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        secondPath = addrs[network].WETH_ADDRESS;
    }

    // quick fix if we use strategy placeholder value
    if (firstPath[0] === '%' || firstPath[0] === '&') {
        firstPath = nullAddress;
        secondPath = nullAddress;
    }

    let path = abiCoder.encode(['address[]'], [[firstPath, secondPath]]);
    if (uniV3fee > 0) {
        if (destAmount > 0) {
            path = hre.ethers.utils.solidityPack(['address', 'uint24', 'address'], [secondPath, uniV3fee, firstPath]);
        } else {
            path = hre.ethers.utils.solidityPack(['address', 'uint24', 'address'], [firstPath, uniV3fee, secondPath]);
        }
    }
    return [
        srcAddr,
        destAddr,
        amount,
        destAmount,
        0,
        0,
        nullAddress,
        wrapper,
        path,
        [nullAddress, nullAddress, nullAddress, 0, 0, hre.ethers.utils.toUtf8Bytes('')],
    ];
};

const formatExchangeObjCurve = async (
    srcAddr,
    destAddr,
    amount,
    wrapper,
) => {
    const { route: sdkRoute } = await curve.getBestRouteAndOutput(
        srcAddr,
        destAddr,
        '1000', // this is fine
    );
    const swapParams = sdkRoute.map((e) => [e.i, e.j, e.swapType]).concat(
        [...Array(4 - sdkRoute.length).keys()].map(
            () => [0, 0, 0],
        ),
    );
    const route = [srcAddr].concat(
        ...sdkRoute.map((e) => [e.poolAddress, e.outputCoinAddress]),
        ...[...Array(8 - (sdkRoute.length) * 2).keys()].map(
            () => [nullAddress],
        ),
    );

    const exchangeData = hre.ethers.utils.defaultAbiCoder.encode(
        ['address[9]', 'uint256[3][4]'],
        [route, swapParams],
    );

    return [
        srcAddr,
        destAddr,
        amount,
        0,
        0,
        0,
        nullAddress,
        wrapper,
        exchangeData,
        [nullAddress, nullAddress, nullAddress, 0, 0, hre.ethers.utils.toUtf8Bytes('')],
    ];
};

const isEth = (tokenAddr) => {
    if (tokenAddr.toLowerCase() === ETH_ADDR.toLowerCase()
    || tokenAddr.toLowerCase() === addrs[network].WETH_ADDRESS.toLowerCase()
    ) {
        return true;
    }

    return false;
};

const convertToWeth = (tokenAddr) => {
    if (isEth(tokenAddr)) {
        return addrs[network].WETH_ADDRESS;
    }

    return tokenAddr;
};

const getProxyAuth = async (proxyAddr, addrWithAuth) => {
    const dsAuth = await hre.ethers.getContractAt('DSAuth', proxyAddr);
    const authorityAddr = await dsAuth.authority();
    const dsGuard = await hre.ethers.getContractAt('DSAuthority', authorityAddr);
    const selector = '0x1cff79cd'; // execute selector

    const hasPermission = await dsGuard.canCall(addrWithAuth, proxyAddr, selector);

    return hasPermission;
};

const setNewExchangeWrapper = async (acc, newAddr) => {
    const exchangeOwnerAddr = addrs[network].EXCHANGE_OWNER_ADDR;
    await sendEther(acc, exchangeOwnerAddr, '1');
    await impersonateAccount(exchangeOwnerAddr);

    const signer = await hre.ethers.provider.getSigner(exchangeOwnerAddr);

    const registryInstance = await hre.ethers.getContractFactory('SaverExchangeRegistry');
    const registry = await registryInstance.attach(addrs[network].SAVER_EXCHANGE_ADDR);
    const registryByOwner = registry.connect(signer);

    await registryByOwner.addWrapper(newAddr, { gasLimit: 300000 });
    await stopImpersonatingAccount(exchangeOwnerAddr);
};

const depositToWeth = async (amount, signer) => {
    const weth = await hre.ethers.getContractAt('IWETH', addrs[network].WETH_ADDRESS);

    if (signer) {
        const wethWithSigner = weth.connect(signer);
        await wethWithSigner.deposit({ value: amount });
    } else {
        await weth.deposit({ value: amount });
    }
};

const formatExchangeObjForOffchain = (
    srcAddr,
    destAddr,
    amount,
    wrapper,
    exchangeAddr,
    allowanceTarget,
    price,
    protocolFee,
    callData,
) => [
    srcAddr,
    destAddr,
    amount,
    0,
    0,
    0,
    nullAddress,
    wrapper,
    [],
    [wrapper, exchangeAddr, allowanceTarget, price, protocolFee, callData],
];

const addToZRXAllowlist = async (acc, newAddr) => {
    const exchangeOwnerAddr = '0xBc841B0dE0b93205e912CFBBd1D0c160A1ec6F00';
    await sendEther(acc, exchangeOwnerAddr, '1');
    await impersonateAccount(exchangeOwnerAddr);

    const signer = await hre.ethers.provider.getSigner(exchangeOwnerAddr);

    const registryInstance = await hre.ethers.getContractFactory('ZrxAllowlist');
    const registry = await registryInstance.attach('0x4BA1f38427b33B8ab7Bb0490200dAE1F1C36823F');
    const registryByOwner = await registry.connect(signer);

    await registryByOwner.setAllowlistAddr(newAddr, true);
    await stopImpersonatingAccount(exchangeOwnerAddr);
};

const getGasUsed = async (receipt) => {
    const parsed = await receipt.wait();

    return parsed.gasUsed.toString();
};

const calcGasToUSD = (gasUsed, gasPriceInGwei) => {
    const ethSpent = (gasUsed * gasPriceInGwei * 1000000000) / 1e18;

    return (ethSpent * getLocalTokenPrice('WETH')).toFixed(0);
};

const getChainLinkPrice = async (tokenAddr) => {
    const feedRegistry = await hre.ethers.getContractAt('IFeedRegistry', FEED_REGISTRY_ADDRESS);

    const data = await feedRegistry.latestRoundData(tokenAddr, USD_DENOMINATION);

    // const decimals = await feedRegistry.decimals(tokenAddr, USD_DENOMINATION);

    return data.answer.toString();
};

const BN2Float = hre.ethers.utils.formatUnits;

const Float2BN = hre.ethers.utils.parseUnits;

const takeSnapshot = async () => hre.network.provider.request({
    method: 'evm_snapshot',
});

const revertToSnapshot = async (snapshotId) => hre.network.provider.request({
    method: 'evm_revert',
    params: [snapshotId],
});

const getWeth = () => addrs[network].WETH_ADDRESS;

const openStrategyAndBundleStorage = async (isFork) => {
    const strategySubAddr = getAddrFromRegistry('StrategyStorage');
    const bundleSubAddr = getAddrFromRegistry('BundleStorage');

    const currOwnerAddr = getOwnerAddr();

    const ownerSigner = await hre.ethers.provider.getSigner(currOwnerAddr);

    if (!isFork) {
        await impersonateAccount(currOwnerAddr);
    }

    let strategyStorage = await hre.ethers.getContractAt('StrategyStorage', strategySubAddr);
    let bundleStorage = await hre.ethers.getContractAt('BundleStorage', bundleSubAddr);

    strategyStorage = strategyStorage.connect(ownerSigner);
    bundleStorage = bundleStorage.connect(ownerSigner);

    await strategyStorage.changeEditPermission(true);
    await bundleStorage.changeEditPermission(true);

    if (!isFork) {
        await stopImpersonatingAccount(currOwnerAddr);
    }
};

async function setForkForTesting() {
    const senderAcc = (await hre.ethers.getSigners())[0];
    await hre.network.provider.send('hardhat_setBalance', [
        senderAcc.address,
        '0xC9F2C9CD04674EDEA40000000',
    ]);
    await hre.network.provider.send('hardhat_setBalance', [
        OWNER_ACC,
        '0xC9F2C9CD04674EDEA40000000',
    ]);
    await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x1', // 1 wei
    ]);
}

const resetForkToBlock = async (block) => {
    if (block) {
        await hre.network.provider.request({
            method: 'hardhat_reset',
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ETHEREUM_NODE,
                        blockNumber: block,
                    },
                },
            ],
        });
    } else {
        await hre.network.provider.request({
            method: 'hardhat_reset',
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ETHEREUM_NODE,
                    },
                },
            ],
        });
    }
    await setForkForTesting();
};

module.exports = {
    addToZRXAllowlist,
    getAddrFromRegistry,
    getProxy,
    getProxyWithSigner,
    redeploy,
    send,
    approve,
    balanceOf,
    formatExchangeObj,
    formatExchangeObjForOffchain,
    isEth,
    sendEther,
    impersonateAccount,
    stopImpersonatingAccount,
    convertToWeth,
    depositToWeth,
    timeTravel,
    fetchStandardAmounts,
    setNewExchangeWrapper,
    fetchAmountinUSDPrice,
    getGasUsed,
    getNameId,
    getChainLinkPrice,
    getLocalTokenPrice,
    calcGasToUSD,
    getProxyAuth,
    getAllowance,
    openStrategyAndBundleStorage,
    redeployCore,
    getOwnerAddr,
    getWeth,
    BN2Float,
    Float2BN,
    addrs,
    AVG_GAS_PRICE,
    standardAmounts,
    nullAddress,
    dydxTokens,
    REGISTRY_ADDR,
    AAVE_MARKET,
    DAI_ADDR,
    KYBER_WRAPPER,
    UNISWAP_WRAPPER,
    OASIS_WRAPPER,
    WETH_ADDRESS,
    ETH_ADDR,
    OWNER_ACC,
    ADMIN_ACC,
    USDC_ADDR,
    AAVE_FL_FEE,
    MIN_VAULT_DAI_AMOUNT,
    MIN_VAULT_RAI_AMOUNT,
    RAI_ADDR,
    MAX_UINT,
    MAX_UINT128,
    LOGGER_ADDR,
    UNIV3ROUTER_ADDR,
    UNIV3POSITIONMANAGER_ADDR,
    YEARN_REGISTRY_ADDRESS,
    placeHolderAddr,
    STETH_ADDRESS,
    UNIV2_ROUTER_ADDRESS,
    DFS_REG_CONTROLLER,
    BAL_ADDR,
    AUNI_ADDR,
    AWETH_ADDR,
    ADAI_ADDR,
    UNI_ADDR,
    ALINK_ADDR,
    LINK_ADDR,
    USDT_ADDR,
    BUSD_ADDR,
    AWBTC_ADDR,
    WBTC_ADDR,
    WSTETH_ADDRESS,
    LUSD_ADDR,
    rariDaiFundManager,
    rdptAddress,
    rariUsdcFundManager,
    rsptAddress,
    AAVE_MARKET_OPTIMISM,
    setBalance,
    takeSnapshot,
    revertToSnapshot,
    mineBlock,
    setForkForTesting,
    resetForkToBlock,
    balanceOfOnTokenInBlock,
    formatExchangeObjCurve,
    curveApiInit: async () => curve.init('Alchemy', {
        url: hre.network.url,
    }),
};