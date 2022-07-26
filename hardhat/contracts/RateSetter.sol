// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "./CDPManager.sol";

contract RateSetter {

    CDPManager private immutable CDPManager_CONTARCT;

    constructor(address _cdpManager) {
        CDPManager_CONTARCT = CDPManager(_cdpManager);
    }

    /*
     * @notice updates rates with values gathered from PI controllers
     */
    function updateRates() public{
        // gather rate from market/redemption controller
        // gather rate from CPI controller
        CDPManager_CONTARCT.updateValue(900);
    }

}