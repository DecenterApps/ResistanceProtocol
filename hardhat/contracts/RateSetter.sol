// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "hardhat/console.sol";
import "./CDPManager.sol";
import "./MarketController.sol";
import "./CPIController.sol";
import "./AbsPiController.sol";

abstract contract CPITrackerOracle {
    function currPegPrice() virtual external view returns (uint256);
}

contract RateSetter {
    uint256 redemptionPrice;
    uint256 marketPrice;
    uint256 CPI;
    uint256 redemptionRate;
    uint256 ethPrice;
    uint256 public constant RAY = 10**27;
    uint256 redemptionPriceUpdateTime;
    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;

    CDPManager private immutable CDPManager_CONTARCT;
    CPIController private immutable CPIController_CONTRACT;
    MarketController private immutable MarketController_CONTRACT;
    AbsPiController private immutable AbsPiController_CONTRACT;

    AggregatorV3Interface private immutable ethPriceFeed;
    CPITrackerOracle private immutable cpiDataFeed;

    constructor(address _cdpManager, address _AbsPiController, address _ethPriceFeedAddress, address _cpiDataFeedAddress) {
        CDPManager_CONTARCT = CDPManager(_cdpManager);
        CPIController_CONTRACT = CPIController(address(0));
        MarketController_CONTRACT = MarketController(address(0));
        AbsPiController_CONTRACT = AbsPiController(_AbsPiController);
        redemptionPrice = 314 * RAY / 100;
        redemptionRate = RAY;
        ethPrice = 1000 * RAY;

        ethPriceFeed = AggregatorV3Interface(_ethPriceFeedAddress);
        cpiDataFeed = CPITrackerOracle(_cpiDataFeedAddress);

        // getEthPrice();
        // getCpiData();

        redemptionPriceUpdateTime=block.timestamp;
    }

    /*
     * @notice updates rates with values gathered from PI controllers
     */
    function updateCDPManagerData() public {
        // gather rate from market/redemption controller
        marketPrice = 5 * 10**18 ; // should get it from oracle
        console.log("============ RP Before ============ ");
        console.log(redemptionPrice);
        // reward caller
        uint256 tlv = AbsPiController_CONTRACT.tlv();
        uint256 iapcr = rpower(AbsPiController_CONTRACT.pscl(), tlv, RAY);
        uint256 validated = AbsPiController_CONTRACT.computeRate(
            marketPrice,
            redemptionPrice,
            iapcr
        );
        console.log("============ Validated ============ ");
        console.log(validated);
        redemptionRate=validated;

        redemptionPrice = rmultiply(
            rpower(
                redemptionRate,
                block.timestamp - redemptionPriceUpdateTime,
                RAY
            ),
            redemptionPrice
        );
        redemptionPriceUpdateTime=block.timestamp;
        console.log("============ RP After ============ ");
        console.log(redemptionPrice);
        // gather rate from CPI controller
        console.log("============ ETH/RP ============ ");
        console.log(ethPrice * EIGHTEEN_DECIMAL_NUMBER /redemptionPrice);
        CDPManager_CONTARCT.updateValue(ethPrice * EIGHTEEN_DECIMAL_NUMBER/redemptionPrice);
    }

    function updateRatesInternal() public {}

    function getEthPrice() public view returns (int256) {
        (, int256 price, , , ) = ethPriceFeed.latestRoundData();
        // has 1e8 decimal points!
        console.log('ethPrice', uint256(price));
        return price;
    }

    function getCpiData() public view returns (uint256) {
        uint256 data = cpiDataFeed.currPegPrice();
        console.log("cpi", data);
        return data;
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
