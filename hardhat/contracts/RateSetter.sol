// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./CDPManager.sol";
import "./AbsPiController.sol";

abstract contract CPITrackerOracle {
    function currPegPrice() external view virtual returns (uint256);
}

error RateSetter__UnknownParameter();
error RateSetter__UnknownContract();
error RateSetter__NotOwner();
error RateSetter__NotAuthorized();

contract RateSetter {
    address public immutable owner;
    uint256 redemptionPrice;
    uint256 CPI;
    uint256 redemptionRate;
    uint256 ethPrice;

    uint256 public constant RAY = 10**27;
    uint256 redemptionPriceUpdateTime;
    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;

    CDPManager private CDPManager_CONTRACT;
    AbsPiController private AbsPiController_CONTRACT;

    CPITrackerOracle private cpiDataFeed;

    // EVENTS

    event ModifyParameters(bytes32 indexed _parameter, uint256 _data);
    event ModifyContract(bytes32 indexed _contract, address _newAddress);
    event NewPrices(uint256 _marketPrice,uint256 _redemptionPrice);
    event NewRedemptionRate(uint256 _value);

    // AUTH

    modifier isOwner() {
        if (owner != msg.sender) revert RateSetter__NotOwner();
        _;
    }

    mapping(address => bool) public authorizedAccounts;

    function addAuthorization(address account) external isOwner {
        authorizedAccounts[account] = true;
    }

    function removeAuthorization(address account) external isOwner {
        authorizedAccounts[account] = false;
    }

    modifier isAuthorized() {
        if (authorizedAccounts[msg.sender] == false)
            revert RateSetter__NotAuthorized();
        _;
    }

    // --- Administration ---

    /*
     * @notice Modify general uint256 params
     * @param _parameter The name of the parameter modified
     * @param _data New value for the parameter
     */
    function modifyParameters(bytes32 _parameter, uint256 _data) external isOwner {
        if (_parameter == "redemptionPriceUpdateTime") redemptionPriceUpdateTime = _data;
        else revert RateSetter__UnknownParameter();
        emit ModifyParameters(_parameter, _data);
    }

    /*
     * @notice Modify contract address
     * @param _contract The name of the contract modified
     * @param _newAddress New address for the contract
     */
    function modifyContracts(bytes32 _contract, address _newAddress) external isOwner {
        if (_contract == "CDPManager") CDPManager_CONTRACT = CDPManager(_newAddress);
        else if (_contract == "AbsPiController") AbsPiController_CONTRACT = AbsPiController(_newAddress);
        else if (_contract == "CPITrackerOracle") cpiDataFeed= CPITrackerOracle(_newAddress);
        else revert RateSetter__UnknownContract();
        emit ModifyContract(_contract, _newAddress);
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
        address _cpiDataFeed
    ) {
        owner = _owner;
        CDPManager_CONTRACT = CDPManager(_cdpManager);
        AbsPiController_CONTRACT = AbsPiController(_AbsPiController);
        redemptionPrice = (100 * 2 * RAY) / 100;
        redemptionRate = RAY;

        cpiDataFeed = CPITrackerOracle(_cpiDataFeed);

        redemptionPriceUpdateTime = block.timestamp;
    }

    /*
     * @notice updates rates with values gathered from PI controllers
     */
    function updatePrices(uint256 _ethTwapPrice, uint256 _noiMarketPrice) public isAuthorized{

        ethPrice = _ethTwapPrice;

        // reward caller 
        uint256 tlv = AbsPiController_CONTRACT.tlv();
        uint256 iapcr = rpower(AbsPiController_CONTRACT.pscl(), tlv, RAY);
        uint256 validated = AbsPiController_CONTRACT.computeRate(
            _noiMarketPrice,
            redemptionPrice,
            iapcr
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
        CDPManager_CONTRACT.setEthRp(_ethTwapPrice *(10**19)* EIGHTEEN_DECIMAL_NUMBER / redemptionPrice);

    }

    function updateRatesInternal() public {}

    function getCpiData() public view returns (uint256) {
        uint256 data = cpiDataFeed.currPegPrice();
        return data;
    }

    function getRedemptionRate() public view returns (uint256){
        return redemptionRate;
    }

    function getRedemptionPrice() public view returns (uint256){
        return redemptionPrice;
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
