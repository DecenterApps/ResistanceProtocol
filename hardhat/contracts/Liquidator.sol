// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Parameters.sol";
import "./CDPManager.sol";

error Liquidator__CDPNotEligibleForLiquidation();

contract Liquidator{

    address parametersContractAddress;
    address cdpManagerContractAddress;
    address rateSetterContractAddress;
    address treasuryContractAddress;
    uint8 treasuryPercent;

    function liquidate(uint256 _cdpIndex) public{
        CDPManager cdpManager = CDPManager(cdpManagerContractAddress);
        uint8 LR = Parameters(parametersContractAddress).getLR();
        CDPManager.CDP memory cdp = cdpManager.getOneCDP(_cdpIndex);

        uint256 redemptionPrice=1000; // should get it from RateSetter contract
        uint256 ethPrice = 1000;     // should get it from RateSetter contract
        uint256 CR = cdp.lockedCollateral*ethPrice*100/cdp.generatedDebt*redemptionPrice;
        
        if(CR>=LR) 
            revert Liquidator__CDPNotEligibleForLiquidation();
        uint256 total = cdp.lockedCollateral;
        uint256 treasuryPart = total*treasuryPercent/100;
        uint256 liquidatorPart = total-treasuryPart;
        (bool sent, ) = payable(treasuryContractAddress).call{
            value: treasuryPart
        }("");
        if(sent == false) revert();
        
        (bool sent2, ) = payable(msg.sender).call{
            value: liquidatorPart
        }("");
        if(sent2 == false) revert();
    }

}