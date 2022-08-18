// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Parameters.sol";
import "./Treasury.sol";
import "./CDPManager.sol";
import "./Liquidator.sol";
import "./RateSetter.sol";
import "./EthTwapFeed.sol";
import "./MarketTwapFeed.sol";

error ShutdownModule__ShutdownNotInitiated();

contract ShutdownModule {
    address private parametersAddress;
    address private treasuryAddress;
    address private cdpmanagerAddress;
    address private liquidatorAddress;
    address private rateSetterAddress;
    address private marketTWAPAddress;
    address private ethTWAPAddress;

    address public immutable owner;

    uint256 constant SECONDS_IN_A_DAY=86400;

    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;
    bool public shutdown = false;
    uint256 public forzenEthRp=0;

    uint256 timeForPhaseOne = SECONDS_IN_A_DAY*2;

    modifier ShutdownInitiated() {
        if (!shutdown) revert ShutdownModule__ShutdownNotInitiated();
        _;
    }

    constructor(address _owner) {
        owner=_owner;
    }

    //Modifiers

    modifier onlyOwner() {
        if (msg.sender != owner) revert CDPManager__OnlyOwnerAuthorization();
        _;
    }

    // Parameters

    function setParametersAddress(address _parametersAddress)
        public
        onlyOwner
    {
        parametersAddress = _parametersAddress;
    }

    function setTreasuryAddress(address _treasuryAddress)
        public
        onlyOwner
    {
        treasuryAddress = _treasuryAddress;
    }

    function setCdpmanagerAddress(address _cdpmanagerAddress)
        public
        onlyOwner
    {
        cdpmanagerAddress = _cdpmanagerAddress;
    }

    function setRateSetterAddress(address _rateSetterAddress)
        public
        onlyOwner
    {
        rateSetterAddress = _rateSetterAddress;
    }

    function setMarketTWAPAddress(address _marketTWAPAddress)
        public
        onlyOwner
    {
        marketTWAPAddress = _marketTWAPAddress;
    }

    function setEthTWAPAddress(address _ethTWAPAddress)
        public
        onlyOwner
    {
        ethTWAPAddress = _ethTWAPAddress;
    }

    function setLiquidatorAddress(address _liquidatorAddress)
        public
        onlyOwner
    {
        liquidatorAddress = _liquidatorAddress;
    }

    //PHASE 0

    function calculateGlobalCR() public view returns (uint256) {
        CDPManager CDPMANAGER_CONTRACT=CDPManager(cdpmanagerAddress);
        uint256 totalSupply = CDPMANAGER_CONTRACT.getTotalSupply();
        uint256 totalDebt = CDPMANAGER_CONTRACT.getTotalDebt();
        uint256 systemSurplus = Treasury(payable(treasuryAddress)).unmintedNoiBalance();
        uint256 ethRp = CDPMANAGER_CONTRACT.ethRp();
        return
            ((totalSupply * ethRp * 100) / (totalDebt + systemSurplus)) /
            EIGHTEEN_DECIMAL_NUMBER;
    }

    function startShutdown() public {
        uint256 globalCR = calculateGlobalCR();
        uint256 globalCRLimit = Parameters(parametersAddress).getGlobalCRLimit();
        if (globalCR <= globalCRLimit) {
            shutdown = true;
            forzenEthRp=CDPManager(cdpmanagerAddress).ethRp();
            shutdownAllContracts();
        }
    }

    function shutdownAllContracts() internal {
        CDPManager(cdpmanagerAddress).shutdown();
        Liquidator(payable(liquidatorAddress)).shutdown();
        RateSetter(rateSetterAddress).shutdown();
        MarketTwapFeed(marketTWAPAddress).shutdown();
        EthTwapFeed(ethTWAPAddress).shutdown();
    }

    //PHASE 1

    function minimum(uint256 _n1, uint256 _n2) public pure returns (uint256) {
        if (_n1 < _n2) return _n1;
        return _n2;
    }

    function processCDP(uint256 _cdpId) public ShutdownInitiated {
        CDPManager CDPMANAGER_CONTRACT=CDPManager(cdpmanagerAddress);
        CDPManager.CDP memory cdp = CDPMANAGER_CONTRACT.getOneCDP(_cdpId);
        uint256 neededCol = cdp.generatedDebt / forzenEthRp;
        uint256 col = cdp.lockedCollateral;

        uint256 min = minimum(neededCol, col);

        CDPMANAGER_CONTRACT.processCDP(_cdpId, min);
    }

    function freeCollateral(uint256 _cdpId) public ShutdownInitiated {
        CDPManager(cdpmanagerAddress).freeCollateral(_cdpId);
    }

    //PHASE 2

    function reedemNOI(uint256 _amount) public ShutdownInitiated{
        Treasury(payable(treasuryAddress)).reedemNoiForCollateral(_amount,msg.sender,forzenEthRp);
    }
}
