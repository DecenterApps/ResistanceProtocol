// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Parameters.sol";
import "./Treasury.sol";
import "./CDPManager.sol";

contract ShutdownModule{

    Parameters private PARAMETERS_CONTRACT;
    Treasury private TREASURY_CONTRACT;
    CDPManager private CDPMANAGER_CONTRACT;

    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;
    bool public shutdown=false;

    constructor(address _parameters,address _treasury, address _cdpManager){
        PARAMETERS_CONTRACT=Parameters(_parameters);
        TREASURY_CONTRACT=Treasury(payable(_treasury));
        CDPMANAGER_CONTRACT=CDPManager(_cdpManager);
    }

    function calculateGlobalCR() public view returns (uint256){
        uint256 totalSupply=CDPMANAGER_CONTRACT.getTotalSupply();
        uint256 totalDebt=CDPMANAGER_CONTRACT.getTotalDebt();
        uint256 ethRp=CDPMANAGER_CONTRACT.ethRp();
        return (totalSupply * ethRp * 100 / totalDebt) / EIGHTEEN_DECIMAL_NUMBER;
    } 

    function startShutdown() public {
        uint256 globalCR=calculateGlobalCR();
        uint256 globalCRLimit=PARAMETERS_CONTRACT.getGlobalCRLimit();
        if(globalCR<=globalCRLimit){
            shutdown=true;
        }
    }
}