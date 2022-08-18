// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Parameters.sol";
import "./Treasury.sol";
import "./CDPManager.sol";

error ShutdownModule__ShutdownNotInitiated();

contract ShutdownModule {
    Parameters private PARAMETERS_CONTRACT;
    Treasury private TREASURY_CONTRACT;
    CDPManager private CDPMANAGER_CONTRACT;

    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;
    bool public shutdown = false;
    uint256 public forzenEthRp=0;

    modifier ShutdownInitiated() {
        if (!shutdown) revert ShutdownModule__ShutdownNotInitiated();
        _;
    }

    constructor(
        address _parameters,
        address _treasury,
        address _cdpManager
    ) {
        PARAMETERS_CONTRACT = Parameters(_parameters);
        TREASURY_CONTRACT = Treasury(payable(_treasury));
        CDPMANAGER_CONTRACT = CDPManager(_cdpManager);
    }

    function calculateGlobalCR() public view returns (uint256) {
        uint256 totalSupply = CDPMANAGER_CONTRACT.getTotalSupply();
        uint256 totalDebt = CDPMANAGER_CONTRACT.getTotalDebt();
        uint256 systemSurplus = TREASURY_CONTRACT.unmintedNoiBalance();
        uint256 ethRp = CDPMANAGER_CONTRACT.ethRp();
        return
            ((totalSupply * ethRp * 100) / (totalDebt + systemSurplus)) /
            EIGHTEEN_DECIMAL_NUMBER;
    }

    function startShutdown() public {
        uint256 globalCR = calculateGlobalCR();
        uint256 globalCRLimit = PARAMETERS_CONTRACT.getGlobalCRLimit();
        if (globalCR <= globalCRLimit) {
            shutdown = true;
            forzenEthRp=CDPMANAGER_CONTRACT.ethRp();
        }
    }

    function shutdownAllContracts() public ShutdownInitiated {
        CDPMANAGER_CONTRACT.shutdown();
    }

    function minimum(uint256 _n1, uint256 _n2) public pure returns (uint256) {
        if (_n1 < _n2) return _n1;
        return _n2;
    }

    function processCDP(uint256 _cdpId) public ShutdownInitiated {
        CDPManager.CDP memory cdp = CDPMANAGER_CONTRACT.getOneCDP(_cdpId);
        uint256 neededCol = cdp.generatedDebt / forzenEthRp;
        uint256 col = cdp.lockedCollateral;

        uint256 min = minimum(neededCol, col);

        CDPMANAGER_CONTRACT.processCDP(_cdpId, min);
    }

    function freeCollateral(uint256 _cdpId) public ShutdownInitiated {
        CDPMANAGER_CONTRACT.freeCollateral(_cdpId);
    }

    function reedemCollateral(uint256 _amount) public ShutdownInitiated{
        TREASURY_CONTRACT.reedemNoiForCollateral(_amount,msg.sender,forzenEthRp);
    }
}
