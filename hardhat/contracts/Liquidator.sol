// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Parameters.sol";
import "./CDPManager.sol";
import "./NOI.sol";


error Liquidator__CDPNotEligibleForLiquidation();

contract Liquidator{

    address parametersContractAddress;
    address cdpManagerContractAddress;
    address rateSetterContractAddress;
    address treasuryContractAddress;
    address noiContractAddress;
    uint8 treasuryPercent = 25; // percent of profit from liquidation

    address private owner;

    constructor(){
        owner = msg.sender;
    }

    modifier onlyOwner(){
        if (msg.sender != owner)
            revert Parameters_NotAuthorized();
        _;
    }

    function isEligibleForLiquidation(CDPManager.CDP memory _cdp) private view returns(bool){

        uint8 LR = Parameters(parametersContractAddress).getLR();

        uint256 redemptionPrice=1000; // should get it from RateSetter contract
        uint256 ethPrice = 1000;     // should get it from RateSetter contract
        uint256 CR = _cdp.lockedCollateral*ethPrice*100/(_cdp.generatedDebt*redemptionPrice);
        
        return CR<LR;
    }

    function isEligibleForLiquidation(uint256 _cdpIndex) public view returns(bool){
        CDPManager cdpManager = CDPManager(cdpManagerContractAddress);
        CDPManager.CDP memory cdp = cdpManager.getOneCDP(_cdpIndex);
        return isEligibleForLiquidation(cdp);
    }

    function liquidateCDP(uint256 _cdpIndex) public payable{
        CDPManager cdpManager = CDPManager(cdpManagerContractAddress);
        CDPManager.CDP memory cdp = cdpManager.getOneCDP(_cdpIndex);

        if(!isEligibleForLiquidation(cdp)) 
            revert Liquidator__CDPNotEligibleForLiquidation();


        // burn dept from liquidator balance
        NOI noiContract = NOI(noiContractAddress);
        noiContract.burn(msg.sender,cdp.generatedDebt);

        cdpManager.liquidatePosition(_cdpIndex);

        // calculate distribution of collateral
        uint256 total = cdp.lockedCollateral;
        uint256 treasuryPart = (total-cdp.generatedDebt)*treasuryPercent/100;
        uint256 liquidatorPart = total-treasuryPart;

        // send part to the Treasury
        (bool sentTreasury, ) = payable(treasuryContractAddress).call{
            value: treasuryPart
        }("");
        if(sentTreasury == false) revert();
        
        // send part to the user that started liquidation 
        (bool sentLiquidator, ) = payable(msg.sender).call{
            value: liquidatorPart
        }("");
        if(sentLiquidator == false) revert();
    }


    function setParametersContractAddress(address _parametersContractAddress) public onlyOwner{
        parametersContractAddress = _parametersContractAddress;
    } 

    function setCdpManagerContractAddress(address _cdpManagerContractAddress) public onlyOwner{
        cdpManagerContractAddress = _cdpManagerContractAddress;
    } 
    function setRateSetterContractAddress(address _rateSetterContractAddress) public onlyOwner{
        rateSetterContractAddress = _rateSetterContractAddress;
    } 
    function setTreasuryContractAddress(address _treasuryContractAddress) public onlyOwner{
        treasuryContractAddress = _treasuryContractAddress;
    } 
    function setNoiContractAddress(address _noiContractAddress) public onlyOwner{
        noiContractAddress = _noiContractAddress;
    } 


    receive() external payable{

    }

}