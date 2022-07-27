// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "hardhat/console.sol";
import "./CDPManager.sol";
import "./MarketController.sol";
import "./CPIController.sol";

contract RateSetter {
    uint256 redemptionPrice;
    uint256 marketPrice;
    uint256 CPI;
    uint256 redemptionRate;
    uint256 ethPrice;

    CDPManager private immutable CDPManager_CONTARCT;
    CPIController private immutable CPIController_CONTRACT;
    MarketController private immutable MarketController_CONTRACT;

    AggregatorV3Interface private immutable ethPriceFeed;
    AggregatorV3Interface private immutable cpiDataFeed;

    constructor(
        address _cdpManager,
        address _ethPriceFeed,
        address _cpiDataFeed
    ) {
        CDPManager_CONTARCT = CDPManager(_cdpManager);
        CPIController_CONTRACT = CPIController(address(0));
        MarketController_CONTRACT = MarketController(address(0));

        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
        cpiDataFeed = AggregatorV3Interface(_cpiDataFeed);
    }

    /*
     * @notice updates rates with values gathered from PI controllers
     */
    function updateCDPManagerData() public {
        // gather rate from market/redemption controller
        // gather rate from CPI controller
        CDPManager_CONTARCT.updateValue(900);
    }

    function updateRatesInternal() public {}

    function getEthPrice() public view returns (int256) {
        (, int256 price, , , ) = ethPriceFeed.latestRoundData();
        console.log(uint256(price));
        return price;
    }
}
