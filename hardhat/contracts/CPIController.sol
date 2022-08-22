// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./RedemptionRateController.sol";

error CPIController__TooSoon();
error CPIController__NotOwner();
error CPIController__ContractNotEnabled();
error CPIController__NotRateSetter();

contract CPIController is RedemptionRateController{

    // --- Modifiers ---
    modifier isOwner() override{
        if (owner != msg.sender) revert CPIController__NotOwner();
        _;
    }

    modifier isContractEnabled() override{
        if (!contractEnabled) revert CPIController__ContractNotEnabled();
        _;
    }

    modifier isRateSetter() override{
        if (msg.sender != rateSetterContractAddress)
            revert CPIController__NotRateSetter();
        _;   
    }

    constructor(address _owner,
        int256  _Kp,
        int256  _Ki,
        uint256 _feedbackOutputUpperBound,
        int256  _feedbackOutputLowerBound,
        uint256 _integralPeriodSize,
        uint256 _perSecondCumulativeLeak
    )
    RedemptionRateController(
        _owner, 
        _Kp,
        _Ki,
        _feedbackOutputUpperBound,
        _feedbackOutputLowerBound,
        _integralPeriodSize,
        _perSecondCumulativeLeak
    ){}

    // --- Computation ---

    ///@notice calculates new redemption rate based on market and redemption values using PI controller logic
    ///@param _marketValue last recorded market value of post-inflation NOI
    ///@param _redemptionValue last recorded redemption value of post-inflation NOI
    ///@param _accumulatedLeak coefficient for weighing combined previous integral terms
    function computeRate(
        uint256 _marketValue,
        uint256 _redemptionValue,
        uint256 _accumulatedLeak
    ) override external 
        isContractEnabled 
        isRateSetter
        returns (uint256)
    {
        if (block.timestamp - lastUpdateTime < integralPeriodSize) {
            revert CPIController__TooSoon();
        }
        alpha = _accumulatedLeak;
        int256 proportionalTerm = int256(_redemptionValue) -
            int256(_marketValue) *
            int256(10**19);
        updateDeviationHistory(proportionalTerm);
        lastUpdateTime = block.timestamp;
        int256 piOutput = getGainAdjustedPIOutput(
            proportionalTerm,
            prevIntegralTerms
        );
        if (piOutput != 0) {
            uint256 newRedemptionRate = getBoundedRedemptionRate(piOutput);
            return TWENTY_SEVEN_DECIMAL_NUMBER * 2 - newRedemptionRate;
        } else {
            return TWENTY_SEVEN_DECIMAL_NUMBER;
        }
    }
}
