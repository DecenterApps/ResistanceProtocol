// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Parameters.sol";
import "./CDPManager.sol";
import "./NOI.sol";

error Liquidator__CDPNotEligibleForLiquidation();
error Liquidator__NotOwner();
error Liquidator__SendToTreasuryFailed();
error Liquidator__SendToUserFailed();
error Liquidator__NotActive();
error Liquidator__NotShutdownModule();

contract Liquidator{

    address parametersContractAddress;
    address cdpManagerContractAddress;
    address rateSetterContractAddress;
    address treasuryContractAddress;
    address noiContractAddress;
    address shutdownModuleContractAddress;
    uint8 treasuryPercent = 25; // percent of profit from liquidation

    address public owner;

    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;

    bool active=true;


    constructor(address _owner){
        owner = _owner;
    }

    modifier onlyOwner(){
        if (msg.sender != owner)
            revert Liquidator__NotOwner();
        _;
    }

    modifier onlyActive(){
        if (!active)
            revert Liquidator__NotActive();
        _;
    }

    modifier onlyShutdownModule(){
        if (msg.sender!=shutdownModuleContractAddress)
            revert Liquidator__NotShutdownModule();
        _;
    }


    event LiquidateCDP(uint256 indexed _cdpIndex, uint _collateral, uint _debt, address indexed _liquidator);



    function isEligibleForLiquidation(uint256 _cdpIndex) public view returns(bool){
        uint256 CR = CDPManager(cdpManagerContractAddress).getCR(_cdpIndex);
        uint256 LR = Parameters(parametersContractAddress).getLR();
        return CR < LR;
    }

    function liquidateCDP(uint256 _cdpIndex) public onlyActive{
        CDPManager cdpManager = CDPManager(cdpManagerContractAddress);
        CDPManager.CDP memory cdp = cdpManager.getOneCDP(_cdpIndex);

        if(!isEligibleForLiquidation(_cdpIndex)) 
            revert Liquidator__CDPNotEligibleForLiquidation();

        uint256 ethRp = CDPManager(cdpManagerContractAddress).ethRp();
        uint256 rpEth = (EIGHTEEN_DECIMAL_NUMBER * EIGHTEEN_DECIMAL_NUMBER) / ethRp;

        
        // calculate distribution of collateral
        uint256 total = cdp.lockedCollateral;
        uint256 totalDebt = cdpManager.getDebtWithSF(_cdpIndex);
        uint256 treasuryPart = (total-totalDebt*rpEth/EIGHTEEN_DECIMAL_NUMBER)*treasuryPercent/100;
        uint256 liquidatorPart = total-treasuryPart;

        cdpManager.liquidatePosition(_cdpIndex, msg.sender);

        // send part to the Treasury
        (bool sentTreasury, ) = payable(treasuryContractAddress).call{
            value: treasuryPart
        }("");
        if(sentTreasury == false) revert Liquidator__SendToTreasuryFailed();
        
        // send part to the user that started liquidation 
        (bool sentLiquidator, ) = payable(msg.sender).call{
            value: liquidatorPart
        }("");
        if(sentLiquidator == false) revert Liquidator__SendToUserFailed();


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
    function setShutdownModuleContractAddress(address _shutdownModuleContractAddress) public onlyOwner{
        shutdownModuleContractAddress = _shutdownModuleContractAddress;
    } 
    function shutdown() public onlyShutdownModule{
        active=false;
    }


    receive() external payable{

    }

}