// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

abstract contract RedemptionRateController {

    // --- Structs ---
    struct DeviationObservation {               // Record of all of the registered calculations 
        uint256 timestamp;
        int256  proportional;
        int256  integral;
    }

    // --- Variables ---
    int256  internal Kp;                        // [EIGHTEEN_DECIMAL_NUMBER], weighing coefficient for the proportional term
    int256  internal Ki;                        // [EIGHTEEN_DECIMAL_NUMBER], weighing coefficient for the integral term
    uint256 internal alpha;                     // [], weighing coefficient for the combined integral terms from previous calculations

    uint256 internal integralPeriodSize;        // [seconds], minimum time between two calculations
    uint256 internal lastUpdateTime;            // [timestamp]

    uint256 internal defaultRedemptionRate;     // [TWENTY_SEVEN_DECIMAL_NUMBER]
    uint256 internal feedbackOutputUpperBound;  // [TWENTY_SEVEN_DECIMAL_NUMBER]
    int256  internal feedbackOutputLowerBound;  // [TWENTY_SEVEN_DECIMAL_NUMBER]

    int256  internal prevIntegralTerms;         // [TWENTY_SEVEN_DECIMAL_NUMBER], combined integral terms from previous calculations
    uint256 public   perSecondCumulativeLeak;   // [TWENTY_SEVEN_DECIMAL_NUMBER]

    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;
    uint256 internal constant TWENTY_SEVEN_DECIMAL_NUMBER = 10**27;
    uint256 internal constant NEGATIVE_RATE_LIMIT = TWENTY_SEVEN_DECIMAL_NUMBER - 1;

    // --- Auth ---
    address public immutable owner;
    address public fuzzyModuleContractAddress;

    // --- Fluctuating/Dynamic Variables ---
    DeviationObservation[] internal deviationObservations;

    // --- Events ---
    event ModifyUintParameter(bytes32 parameter, uint256 data);
    event ModifyIntParameter(bytes32 parameter, int256 data);

    // --- Modifiers ---
    modifier onlyOwner() virtual;
    modifier onlyFuzzyModule() virtual;

    // --- Functions ---    
    constructor(
        address _owner,
        uint256 _alpha,
        int256 _Kp,
        int256 _Ki,
        uint256 _feedbackOutputUpperBound,
        int256 _feedbackOutputLowerBound,
        uint256 _integralPeriodSize,
        uint256 _perSecondCumulativeLeak
    ) {
        owner = _owner;
        alpha = _alpha;
        defaultRedemptionRate = TWENTY_SEVEN_DECIMAL_NUMBER;
        Kp = _Kp;
        Ki = _Ki;
        feedbackOutputUpperBound = _feedbackOutputUpperBound;
        feedbackOutputLowerBound = _feedbackOutputLowerBound;
        integralPeriodSize = _integralPeriodSize;
        perSecondCumulativeLeak = _perSecondCumulativeLeak;
        lastUpdateTime = block.timestamp;

        emit ModifyIntParameter("Kp", Kp);
        emit ModifyIntParameter("Ki", Ki);

        emit ModifyUintParameter(
            "integralPeriodSize", 
            integralPeriodSize
        );
        emit ModifyUintParameter(
            "feedbackOutputUpperBound",
            feedbackOutputUpperBound
        );
        emit ModifyIntParameter(
            "feedbackOutputLowerBound",
            feedbackOutputLowerBound
        );
        emit ModifyUintParameter(
            "perSecondCumulativeLeak",
            perSecondCumulativeLeak
        );
    }

    // --- Util functions ---
    function modifyIntParameter(bytes32 _parameter, int256 _value)
        external
        onlyOwner
    {
        if (_parameter == "Kp") Kp = _value;
        else if (_parameter == "Ki") Ki = _value;
        else if (_parameter == "Ki") Ki = _value;
        else if (_parameter == "feedbackOutputLowerBound")
            feedbackOutputLowerBound = _value;
        emit ModifyIntParameter(_parameter, _value);
    }

    function modifyUintParameter(bytes32 _parameter, uint256 _value)
        external
        onlyOwner
    {
        if (_parameter == "feedbackOutputUpperBound")
            feedbackOutputUpperBound = _value;
        else if (_parameter == "integralPeriodSize") integralPeriodSize = _value;
        else if (_parameter ==  "alpha") alpha = _value;
        else if (_parameter == "perSecondCumulativeLeak")
            perSecondCumulativeLeak = _value;
        emit ModifyUintParameter(_parameter, _value);
    }


    // --- Computation ---

    ///@notice calculates new redemption rate based on market and redemption values using PI controller logic
    ///@param _marketValue last recorded market value of post-inflation NOI
    ///@param _redemptionValue last recorded redemption value of post-inflation NOI
    function computeRate(
        uint256 _marketValue,
        uint256 _redemptionValue
    )virtual external returns (uint256);

    ///@notice calculates new integral term and records current deviation
    ///@param _proportionalTerm proportional term in controller
    function updateDeviationHistory(int256 _proportionalTerm) internal {
        int256 virtualDeviationCumulative = getNextPriceDeviationCumulative(
            _proportionalTerm
        );
        prevIntegralTerms = virtualDeviationCumulative;
        deviationObservations.push(
            DeviationObservation(
                block.timestamp,
                _proportionalTerm,
                prevIntegralTerms
            )
        );
    }

    // --- Util functions ---

    ///@notice returns elapsed time sice last update    
    function tlv() external view returns (uint256) {
        uint256 elapsed = (lastUpdateTime == 0)
            ? 0
            : block.timestamp - lastUpdateTime;
        return elapsed;
    }

    function setFuzzyModuleContractAddress(address _address) external onlyOwner{
        fuzzyModuleContractAddress = _address;
    }

    function getLastProportionalTerm() public view returns (int256) {
        if (oll() == 0) return 0;
        return deviationObservations[oll() - 1].proportional;
    }

    ///@notice returns number of deviation observations
    function oll() public view returns (uint256) {
        return deviationObservations.length;
    }

    ///@notice calculates the integral term
    ///@param _proportionalTerm calculated proportional term
    function getNextPriceDeviationCumulative(
        int256 _proportionalTerm
    ) public view returns (int256) {
        int256 lastProportionalTerm = getLastProportionalTerm();
        uint256 timeElapsed = (lastUpdateTime == 0)
            ? 0
            : block.timestamp - lastUpdateTime;
        int256 newTimeAdjustedDeviation = riemannSum(
            _proportionalTerm,
            lastProportionalTerm
        ) * int256(timeElapsed);
        int256 leakedPriceCumulative = (int256(alpha) *
            prevIntegralTerms) / int256(TWENTY_SEVEN_DECIMAL_NUMBER);

        return leakedPriceCumulative + newTimeAdjustedDeviation;
    }

    ///@notice calculates PI output based on provided proportional and integral terms
    ///@param _proportionalTerm proportional term in controller
    ///@param _integralTerm integral term in controller
    function getGainAdjustedPIOutput(int256 _proportionalTerm, int256 _integralTerm)
        public
        view
        returns (int256)
    {
        (int256 adjustedProportional, int256 adjustedIntegral) = getGainAdjustedTerms(
            _proportionalTerm,
            _integralTerm
        );
        return adjustedProportional + adjustedIntegral;
    }

    ///@notice calculates proportional and integral term multiplied by coeffs
    ///@param _proportionalTerm proportional term in controller
    ///@param _integralTerm integral term in controller
    function getGainAdjustedTerms(int256 _proportionalTerm, int256 _integralTerm)
        public
        view
        returns (int256, int256)
    {
        return (
            (_proportionalTerm * int256(Kp)) / int256(EIGHTEEN_DECIMAL_NUMBER),
            (_integralTerm * int256(Ki)) / int256(EIGHTEEN_DECIMAL_NUMBER)
        );
    }
    
    ///@notice provides new redemption rate by bounding the output of PI controller
    ///@param _piOutput output of PI controller
    function getBoundedRedemptionRate(int256 _piOutput)
        public
        view
        returns (uint256)
    {
        int256 boundedPIOutput = _piOutput;
        uint256 newRedemptionRate;

        if (_piOutput < feedbackOutputLowerBound) {
            boundedPIOutput = feedbackOutputLowerBound;
        } else if (_piOutput > int256(feedbackOutputUpperBound)) {
            boundedPIOutput = int256(feedbackOutputUpperBound);
        }

        bool negativeOutputExceedsHundred = (boundedPIOutput < 0 &&
            -boundedPIOutput >= int256(defaultRedemptionRate));
        if (negativeOutputExceedsHundred) {
            newRedemptionRate = NEGATIVE_RATE_LIMIT;
        } else {
            if (
                boundedPIOutput < 0 &&
                boundedPIOutput <= -int256(NEGATIVE_RATE_LIMIT)
            ) {
                newRedemptionRate = uint256(
                    int256(defaultRedemptionRate) + (-int256(NEGATIVE_RATE_LIMIT))
                );
            } else {
                newRedemptionRate = uint256(
                    int256(defaultRedemptionRate) + boundedPIOutput
                );
            }
        }
        return newRedemptionRate;
    }

    // --- PI Specific Math ---
    
    function riemannSum(int256 _x, int256 _y) internal pure returns (int256) {
        return (_x + _y) / 2;
    }

    function absolute(int256 _x) internal pure returns (uint256 _z) {
        _z = (_x < 0) ? uint256(-_x) : uint256(_x);
    }
}

