// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./CDPManager.sol";
import "./AbsPiController.sol";
import "./FuzzyModule.sol";
import "./CPIController.sol";

abstract contract CPITrackerOracle {
    function currPegPrice() external view virtual returns (uint256);
}

error RateSetter__UnknownParameter();
error RateSetter__UnknownContract();
error RateSetter__NotOwner();
error RateSetter__NotMarketTwapFeed();
error RateSetter__NotShutdownModule();
error RateSetter__NotActive();

contract RateSetter {
    address public immutable owner;
    address public marketTwapFeedContractAddress;  
    address public shutdownModuleContractAddress;
    uint256 redemptionPrice;
    uint256 CPI;
    uint256 redemptionRate;
    uint256 ethPrice;
    uint256 nextEthPrice;

    uint256 public constant RAY = 10**27;
    uint256 public constant SECONDS_IN_A_YEAR = 31556926;
    uint256 redemptionPriceUpdateTime;
    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;

    CDPManager          private CDPManager_CONTRACT;

    CPITrackerOracle private cpiDataFeed;
    uint256 private lastCpiValue;
    uint256 private baseCpiValue;
    uint256 private lastCpiUpdate;

    AbsPiController     private AbsPiController_CONTRACT;
    CPIController       private CPIController_CONTRACT;
    FuzzyModule         private FuzzyModule_CONTRACT;

    bool active = true;

    // EVENTS

    event ModifyParameters(bytes32 indexed _parameter, uint256 _data);
    event ModifyContract(bytes32 indexed _contract, address _newAddress);
    event ModifyAddressParameter(bytes32 indexed _parameter, address _value);
    event NewPrices(uint256 _marketPrice, uint256 _redemptionPrice);
    event NewRedemptionRate(uint256 _value);

    // AUTH

    modifier onlyOwner() {
        if (owner != msg.sender) revert RateSetter__NotOwner();
        _;
    }

    modifier onlyMarketTwapFeed() {
        if (msg.sender != marketTwapFeedContractAddress)
            revert RateSetter__NotMarketTwapFeed();
        _;
    }

    modifier onlyShutdownModule() {
        if (msg.sender != shutdownModuleContractAddress)
            revert RateSetter__NotShutdownModule();
        _;
    }

    modifier isActive() {
        if (!active)
            revert RateSetter__NotActive();
        _;
    }

    // --- Administration ---

    /*
     * @notice Modify general uint256 params
     * @param _parameter The name of the parameter modified
     * @param _data New value for the parameter
     */

    function modifyParameters(bytes32 _parameter, uint256 _data)
        external
        onlyOwner
        isActive
    {
        if (_parameter == "redemptionPriceUpdateTime")
            redemptionPriceUpdateTime = _data;
        else revert RateSetter__UnknownParameter();
        emit ModifyParameters(_parameter, _data);
    }

    /*
     * @notice Modify contract address
     * @param _contract The name of the contract modified
     * @param _newAddress New address for the contract
     */

    function modifyContracts(bytes32 _contract, address _newAddress)
        external
        onlyOwner
        isActive
    {
        if (_contract == "CDPManager")
            CDPManager_CONTRACT = CDPManager(_newAddress);
        else if (_contract == "AbsPiController")
            AbsPiController_CONTRACT = AbsPiController(_newAddress);
        else if (_contract == "CPIController")
            CPIController_CONTRACT = CPIController(_newAddress);
        else if (_contract == "FuzzyModule")
            FuzzyModule_CONTRACT = FuzzyModule(_newAddress);
        else if (_contract == "CPITrackerOracle")
            cpiDataFeed = CPITrackerOracle(_newAddress);
        else revert RateSetter__UnknownContract();
        emit ModifyContract(_contract, _newAddress);
    }

    function modifyAddressParameter(bytes32 _parameter, address _value) external onlyOwner{
        if(_parameter == "MarketTwapFeed") marketTwapFeedContractAddress = _value;
        else if (_parameter == "ShutdownModule") shutdownModuleContractAddress = _value;
        else revert RateSetter__UnknownParameter();
        emit ModifyAddressParameter(_parameter,_value);
    }

    /*
     * @param _owner owner of the contract
     * @param _cdpManager contract address
     * @param _AbsPiController PI controller address
     * @param _marketTwapFeed market contract address
     * @param _cpiDataFeed external cpiDataFeed contract address
     */
    constructor(
        address _owner,
        address _cdpManager,
        address _AbsPiController,
        address _CPIController,
        address _cpiDataFeed
    ) {
        owner = _owner;
        CDPManager_CONTRACT = CDPManager(_cdpManager);
        AbsPiController_CONTRACT = AbsPiController(_AbsPiController);
        CPIController_CONTRACT = CPIController(_CPIController);

        //redemptionPrice = RAY * 2;
        redemptionPrice = RAY;
        redemptionRate = RAY;

        cpiDataFeed = CPITrackerOracle(_cpiDataFeed);
        CPI = cpiDataFeed.currPegPrice();

        redemptionPriceUpdateTime = block.timestamp;

        lastCpiUpdate = block.timestamp;
        uint256 cpi = cpiDataFeed.currPegPrice();
        lastCpiValue = cpi;
        baseCpiValue = cpi;
    }

    /*
     * @notice updates rates with values gathered from PI controllers
     */

    function updatePrices(uint256 _ethTwapPrice, uint256 _noiMarketPrice)
        public
        onlyMarketTwapFeed
        isActive
    {
        CPI = cpiDataFeed.currPegPrice();
        ethPrice = nextEthPrice;
        nextEthPrice = _ethTwapPrice;
        // reward caller 

        uint256 tlvAbs = AbsPiController_CONTRACT.tlv();
        uint256 iapcrAbs = rpower(AbsPiController_CONTRACT.perSecondCumulativeLeak(), tlvAbs, RAY);

        uint256 tlvCPI = CPIController_CONTRACT.tlv();
        uint256 iapcrCPI = rpower(CPIController_CONTRACT.perSecondCumulativeLeak(), tlvCPI, RAY);

        uint256 validated = FuzzyModule_CONTRACT.computeRate(
            _noiMarketPrice,
            redemptionPrice,
            CPI,
            iapcrAbs,
            iapcrCPI
        );

        redemptionRate = validated;
        emit NewRedemptionRate(redemptionRate);

        redemptionPrice = rmultiply(
            rpower(
                redemptionRate,
                block.timestamp - redemptionPriceUpdateTime,
                RAY
            ),
            redemptionPrice
        );
        emit NewPrices(_noiMarketPrice, redemptionPrice);

        redemptionPriceUpdateTime = block.timestamp;
           
        // set Eth/Redemption Rate
        CDPManager_CONTRACT.setEthRp(
            (_ethTwapPrice * (10**19) * EIGHTEEN_DECIMAL_NUMBER) /
                redemptionPrice
        );


    }

    function getCpiData() public returns (uint256 cpi) {

        uint256 currentCPI = cpiDataFeed.currPegPrice();

        if(currentCPI != lastCpiValue) {
            baseCpiValue = lastCpiUpdate;
            lastCpiValue = currentCPI;
            lastCpiUpdate = block.timestamp;
        }
        
        cpi = baseCpiValue + (currentCPI - baseCpiValue) * (block.timestamp - lastCpiUpdate) / (28 days);
    }

    function getYearlyRedemptionRates() public view returns (uint256[] memory) {
        uint256[] memory redemptionRates = new uint256[](2);

        uint256 AbsPi_RR = AbsPiController_CONTRACT.currentRedemptionRate();
        uint256 CPI_RR = CPIController_CONTRACT.currentRedemptionRate();

        redemptionRates[0] = rpower(AbsPi_RR, SECONDS_IN_A_YEAR, RAY);
        redemptionRates[1] = rpower(CPI_RR, SECONDS_IN_A_YEAR, RAY);

        return redemptionRates;
    }

    function getYearlyProportionalTerms() public view returns (uint256[] memory) {
        uint256[] memory proportionalTerms = new uint256[](2);

        uint256 pTermAbs = uint256(
            AbsPiController_CONTRACT.lastAdjustedProportionalTerm()
        );
        uint256 pTermCPI = uint256(
            CPIController_CONTRACT.lastAdjustedProportionalTerm()
        );
        
        proportionalTerms[0] = rpower(pTermAbs + RAY, SECONDS_IN_A_YEAR, RAY);
        proportionalTerms[1] = rpower(pTermCPI + RAY, SECONDS_IN_A_YEAR, RAY);

        return proportionalTerms;
    }

    function getYearlyIntegralTerms() public view returns (uint256[] memory) {
        uint256[] memory integralTerms = new uint256[](2);

        uint256 iTermAbs = uint256(
            AbsPiController_CONTRACT.lastAdjustedIntegralTerm()
        );
        uint256 iTermCPI = uint256(
            CPIController_CONTRACT.lastAdjustedIntegralTerm()
        );
        
        integralTerms[0] = rpower(iTermAbs + RAY, SECONDS_IN_A_YEAR, RAY);
        integralTerms[1] = rpower(iTermCPI + RAY, SECONDS_IN_A_YEAR, RAY);

        return integralTerms;
    }

    function getRedemptionRate() public view returns (uint256) {
        return redemptionRate;
    }

    function getRedemptionPrice() public view returns (uint256) {
        return redemptionPrice;
    }

    function shutdown() public onlyShutdownModule{
        active = false;
    }

    function rpower(
        uint x,
        uint n,
        uint base
    ) public pure returns (uint z) {
        assembly {
            switch x
            case 0 {
                switch n
                case 0 {
                    z := base
                }
                default {
                    z := 0
                }
            }
            default {
                switch mod(n, 2)
                case 0 {
                    z := base
                }
                default {
                    z := x
                }
                let half := div(base, 2) // for rounding.
                for {
                    n := div(n, 2)
                } n {
                    n := div(n, 2)
                } {
                    let xx := mul(x, x)
                    if iszero(eq(div(xx, x), x)) {
                        revert(0, 0)
                    }
                    let xxRound := add(xx, half)
                    if lt(xxRound, xx) {
                        revert(0, 0)
                    }
                    x := div(xxRound, base)
                    if mod(n, 2) {
                        let zx := mul(z, x)
                        if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) {
                            revert(0, 0)
                        }
                        let zxRound := add(zx, half)
                        if lt(zxRound, zx) {
                            revert(0, 0)
                        }
                        z := div(zxRound, base)
                    }
                }
            }
        }
    }

    function rmultiply(uint x, uint y) public pure returns (uint z) {
        z = (x * y) / RAY;
    }
}
