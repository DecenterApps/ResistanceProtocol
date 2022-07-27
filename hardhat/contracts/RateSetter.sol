// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

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

    constructor(address _cdpManager) {
        CDPManager_CONTARCT = CDPManager(_cdpManager);

    }

    /*
     * @notice updates rates with values gathered from PI controllers
     */
    function updateCDPManagerData() public{
        // gather rate from market/redemption controller
        // gather rate from CPI controller
        CDPManager_CONTARCT.updateValue(900);
    }

    function updateRatesInternal() public {

    }

}