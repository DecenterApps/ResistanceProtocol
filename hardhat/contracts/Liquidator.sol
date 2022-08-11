// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Parameters.sol";
import "./CDPManager.sol";
import "./NOI.sol";

import "hardhat/console.sol";

error Liquidator__CDPNotEligibleForLiquidation();

contract Liquidator{

    address parametersContractAddress;
    address cdpManagerContractAddress;
    address rateSetterContractAddress;
    address treasuryContractAddress;
    address noiContractAddress;
    uint8 treasuryPercent = 25; // percent of profit from liquidation

    address public owner;

    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;


    constructor(address _owner){
        owner = _owner;
    }

    modifier onlyOwner(){
        if (msg.sender != owner)
            revert Parameters_NotAuthorized();
        _;
    }


    event LiquidateCDP(uint256 indexed _cdpIndex, uint _collateral, uint _debt, address indexed _liquidator);


    function isEligibleForLiquidation(CDPManager.CDP memory _cdp) private view returns(bool){

        uint256 LR = Parameters(parametersContractAddress).getLR() * EIGHTEEN_DECIMAL_NUMBER;

        uint256 ethRp = CDPManager(cdpManagerContractAddress).ethRp();
        uint256 CR = _cdp.lockedCollateral*ethRp*100/(_cdp.generatedDebt);

        return CR <= LR;
    }

    function isEligibleForLiquidation(uint256 _cdpIndex) public view returns(bool){
        CDPManager cdpManager = CDPManager(cdpManagerContractAddress);
        CDPManager.CDP memory cdp = cdpManager.getOneCDP(_cdpIndex);
        return isEligibleForLiquidation(cdp);
    }

    function liquidateCDP(uint256 _cdpIndex) public {
        CDPManager cdpManager = CDPManager(cdpManagerContractAddress);
        CDPManager.CDP memory cdp = cdpManager.getOneCDP(_cdpIndex);

        if(!isEligibleForLiquidation(cdp)) 
            revert Liquidator__CDPNotEligibleForLiquidation();

        cdpManager.liquidatePosition(_cdpIndex, msg.sender);

        uint256 ethRp = CDPManager(cdpManagerContractAddress).ethRp();
        uint256 rpEth = (EIGHTEEN_DECIMAL_NUMBER * EIGHTEEN_DECIMAL_NUMBER) / ethRp;

        
        // calculate distribution of collateral
        uint256 total = cdp.lockedCollateral;
        uint256 treasuryPart = (total-cdp.generatedDebt*rpEth/EIGHTEEN_DECIMAL_NUMBER)*treasuryPercent/100;
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

        emit LiquidateCDP(_cdpIndex,cdp.lockedCollateral,cdp.generatedDebt,msg.sender);
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