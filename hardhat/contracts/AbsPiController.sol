// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./RedemptionRateController.sol";

error AbsPiController__NotFuzzyModule();
error AbsPiController__NotOwner();
error AbsPiController__TooSoon();

contract AbsPiController is RedemptionRateController{

    modifier onlyOwner() override {
        if (owner != msg.sender) revert AbsPiController__NotOwner();
        _;
    }

    modifier onlyFuzzyModule() override {
        if(msg.sender != fuzzyModuleContractAddress) 
            revert AbsPiController__NotFuzzyModule();
        _;
    }

    constructor(
        address _owner,
        uint256 _alpha,
        int256 _Kp,
        int256 _Ki,
        uint256 _feedbackOutputUpperBound,
        int256 _feedbackOutputLowerBound,
        uint256 _integralPeriodSize,
        uint256 _perSecondCumulativeLeak

    ) 
    RedemptionRateController(
        _owner, 
        _alpha,
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
    function computeRate(
        uint256 _marketPrice,
        uint256 _redemptionPrice,
        uint256 _alpha
    ) override external 
        onlyFuzzyModule 
        returns (uint256) 
    {
        if (block.timestamp - lastUpdateTime < integralPeriodSize) {
            revert AbsPiController__TooSoon();
        }

        alpha = _alpha;
        
        int256 proportionalTerm = int256(_redemptionPrice) -
            int256(_marketPrice) *
            int256(10**19);
        updateDeviationHistory(proportionalTerm);

        lastUpdateTime = block.timestamp;
        int256 piOutput = getGainAdjustedPIOutput(
            proportionalTerm,
            prevIntegralTerms
        );
        if (piOutput != 0) {
            uint256 newRedemptionRate = getBoundedRedemptionRate(piOutput);
            currentRedemptionRate = newRedemptionRate;
        } else {
            currentRedemptionRate = TWENTY_SEVEN_DECIMAL_NUMBER;
        }
        return currentRedemptionRate;
    }    
}
