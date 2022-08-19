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
error ShutdownModule__ShutdownInitiated();
error ShutdownModule__OnlyOwnerAuthorization();
error ShutdownModule__NotPhaseOne();
error ShutdownModule__NotPhaseTwo();

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
    uint256 public shutdownTime;

    uint256 timeForPhaseOne = SECONDS_IN_A_DAY*2;
    uint256 timeForPhaseTwo = SECONDS_IN_A_DAY*2;

    constructor(address _owner) {
        owner=_owner;
        shutdownTime=block.timestamp;
    }

    // EVENTS

    event ShutdownStarted(uint256 _time);
    event CDPProcessed(uint256 _cdpId,uint256 _debtSettled, uint256 _collateralConsumed);
    event CollateralReclaimed(uint256 _cdpId);
    event NOIRedeemed(uint256 _amount,address _to);
    event ModifyParameters(bytes32 _parameter,uint256 _data);

    //Modifiers

    modifier onlyOwner() {
        if (msg.sender != owner) revert ShutdownModule__OnlyOwnerAuthorization();
        _;
    }

    modifier isPhaseOne() {
        if (block.timestamp <= shutdownTime || block.timestamp > shutdownTime + timeForPhaseOne) revert ShutdownModule__NotPhaseOne();
        _;
    }

    modifier isPhaseTwo() {
        if (block.timestamp <= shutdownTime + timeForPhaseOne || block.timestamp > shutdownTime + timeForPhaseOne + timeForPhaseTwo) revert ShutdownModule__NotPhaseTwo();
        _;
    }

    modifier ShutdownInitiated() {
        if (!shutdown) revert ShutdownModule__ShutdownNotInitiated();
        _;
    }

    modifier ShutdownNotInitiated() {
        if (shutdown) revert ShutdownModule__ShutdownInitiated();
        _;
    }

    // Parameters

    function modifyParameters(bytes32 _parameter, uint256 _data)
        external
        onlyOwner
        ShutdownNotInitiated
    {
        if (_parameter == "timeForPhaseOne") timeForPhaseOne = _data;
        else if(_parameter == "timeForPhaseTwo") timeForPhaseTwo = _data; 
        else revert CDPManager__UnknownParameter();
        emit ModifyParameters(_parameter, _data);
    }

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

    /// @notice calculates global collateralisation ratio
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

    /// @notice starts the process of shutdown if global collateralisation ratio is under the allowed limit
    function startShutdown() public {
        uint256 globalCR = calculateGlobalCR();
        uint256 globalCRLimit = Parameters(parametersAddress).getGlobalCRLimit();
        if (globalCR <= globalCRLimit) {
            shutdown = true;
            shutdownTime=block.timestamp;
            forzenEthRp=CDPManager(cdpmanagerAddress).ethRp();
            shutdownAllContracts();
            emit ShutdownStarted(block.timestamp);
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

    /// @notice process one CDP, settle debt and move some collateral to the treasury
    /// @param _cdpId id of the CDP
    function processCDP(uint256 _cdpId) public ShutdownInitiated isPhaseOne {
        CDPManager CDPMANAGER_CONTRACT = CDPManager(cdpmanagerAddress);
        CDPManager.CDP memory cdp = CDPMANAGER_CONTRACT.getOneCDP(_cdpId);
        uint256 neededCol = cdp.generatedDebt * EIGHTEEN_DECIMAL_NUMBER / forzenEthRp;
        uint256 col = cdp.lockedCollateral;
        uint256 min = minimum(neededCol, col);

        CDPMANAGER_CONTRACT.processCDP(_cdpId, min);
        emit CDPProcessed(_cdpId,cdp.generatedDebt,min);
    }

    /// @notice reclaim the remaining collateral in a processed CDP
    /// @param _cdpId id of the CDP
    function freeCollateral(uint256 _cdpId) public ShutdownInitiated isPhaseOne {
        CDPManager(cdpmanagerAddress).freeCollateral(_cdpId);
        emit CollateralReclaimed(_cdpId);
    }

    //PHASE 2

    /// @notice redeem NOI in msg.sender wallet for collateral in the treasury
    /// @param _amount amount of NOI to redeem
    function reedemNOI(uint256 _amount) public ShutdownInitiated isPhaseTwo {
        Treasury(payable(treasuryAddress)).reedemNoiForCollateral(_amount,msg.sender,forzenEthRp);
        emit NOIRedeemed(_amount,msg.sender);
    }
}
