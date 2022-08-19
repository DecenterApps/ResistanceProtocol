// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./RedemptionRateController.sol";

error AbsPiController__NotRateSetter();
error AbsPiController__NotOwner();
error AbsPiController__TooSoon();
error AbsPiController__ContractNotEnabled();

contract AbsPiController is RedemptionRateController{

    modifier isOwner() override {
        if (owner != msg.sender) revert AbsPiController__NotOwner();
        _;
    }

    modifier isContractEnabled() override {
        if (!contractEnabled) revert AbsPiController__ContractNotEnabled();
        _;
    }

    modifier isRateSetter() override {
        if(msg.sender != rateSetterContractAddress) 
            revert AbsPiController__NotRateSetter();
        _;
    }

    constructor(
        address _owner,
        int256 _Kp,
        int256 _Ki,
        uint256 _feedbackOutputUpperBound,
        int256 _feedbackOutputLowerBound,
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

    // --- COMPUTATION ---

    ///@notice calculates new redemption rate based on market and redemption values using PI controller logic
    ///@param _marketPrice last recorded market price of NOI
    ///@param _redemptionPrice last recorded redemption price of NOI
    ///@param _accumulatedLeak coefficient for weighing combined previous integral terms
    function computeRate(
        uint _marketPrice,
        uint _redemptionPrice,
        uint _accumulatedLeak
    ) override external 
        isContractEnabled 
        isRateSetter 
        returns (uint256) 
    {
        if (block.timestamp - lastUpdateTime < integralPeriodSize) {
            revert AbsPiController__TooSoon();
        }
        alpha = _accumulatedLeak;
        int256 proportionalTerm = int(_redemptionPrice) -
            int(_marketPrice) *
            int(10**19);
        updateDeviationHistory(proportionalTerm);
        lastUpdateTime = block.timestamp;
        int256 piOutput = getGainAdjustedPIOutput(
            proportionalTerm,
            prevIntegralTerms
        );
        if (piOutput != 0) {
            uint newRedemptionRate = getBoundedRedemptionRate(piOutput);
            return newRedemptionRate;
        } else {
            return TWENTY_SEVEN_DECIMAL_NUMBER;
        }
    }

    
    
}
