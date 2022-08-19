// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

error AbsPiController__NotRateSetter();
error AbsPiController__NotOwner();
error AbsPiController__TooSoon();
error AbsPiController__ContractNotEnabled();

contract AbsPiController {
    // --- Auth ---
    address public immutable owner;

    bool public contractEnabled;

    modifier isOwner() {
        if (owner != msg.sender) revert AbsPiController__NotOwner();
        _;
    }

    modifier isContractEnabled() {
        if (!contractEnabled) revert AbsPiController__ContractNotEnabled();
        _;
    }

    modifier isRateSetter() {
        if(msg.sender != rateSetterContractAddress) 
            revert AbsPiController__NotRateSetter();
        _;
    }

    // EVENTS

    event ModifyUintParameter(bytes32 parameter, uint256 data);
    event ModifyIntParameter(bytes32 parameter, int256 data);

    // --- Structs ---
    struct DeviationObservation {
        uint timestamp;
        int proportional;
        int integral;
    }

    // -- Static & Default Variables ---
    int internal Kp; // [EIGHTEEN_DECIMAL_NUMBER]
    int internal Ki; // [EIGHTEEN_DECIMAL_NUMBER]

    uint256 internal defaultRedemptionRate; // [TWENTY_SEVEN_DECIMAL_NUMBER]
    uint256 internal feedbackOutputUpperBound; // [TWENTY_SEVEN_DECIMAL_NUMBER]
    int256 internal feedbackOutputLowerBound; // [TWENTY_SEVEN_DECIMAL_NUMBER]
    uint256 internal integralPeriodSize; // [seconds]

    // --- Fluctuating/Dynamic Variables ---
    DeviationObservation[] internal deviationObservations;

    int256 internal priceDeviationCumulative; // [TWENTY_SEVEN_DECIMAL_NUMBER]
    uint256 internal perSecondCumulativeLeak; // [TWENTY_SEVEN_DECIMAL_NUMBER]
    uint256 internal lastUpdateTime; // [timestamp]

    uint256 internal constant NEGATIVE_RATE_LIMIT =
        TWENTY_SEVEN_DECIMAL_NUMBER - 1;
    uint256 internal constant TWENTY_SEVEN_DECIMAL_NUMBER = 10**27;
    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;

    address rateSetterContractAddress;

    constructor(
        address _owner,
        int256 _Kp,
        int256 _Ki,
        uint256 _feedbackOutputUpperBound,
        int256 _feedbackOutputLowerBound,
        uint256 _integralPeriodSize,
        uint256 _perSecondCumulativeLeak
    ) {
        owner = _owner;
        contractEnabled = true;
        defaultRedemptionRate = TWENTY_SEVEN_DECIMAL_NUMBER;
        Kp = _Kp;
        Ki = _Ki;
        feedbackOutputUpperBound = uint256(type(int256).max);
        feedbackOutputLowerBound = -type(int256).max;
        integralPeriodSize = _integralPeriodSize;
        perSecondCumulativeLeak = _perSecondCumulativeLeak;
        lastUpdateTime = block.timestamp;

        emit ModifyIntParameter("Kp", Kp);
        emit ModifyIntParameter("Ki", Ki);
        emit ModifyUintParameter("integralPeriodSize", integralPeriodSize);
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

    function setEnabled(bool _enabled) public isOwner {
        contractEnabled = _enabled;
    }

    function setRateSetterContractAddress(address _address) external isOwner{
        rateSetterContractAddress = _address;
    }

    function modifyIntParameter(bytes32 parameter, int256 data)
        external
        isOwner
        isContractEnabled
    {
        if (parameter == "Kp") Kp = data;
        else if (parameter == "Ki") Ki = data;
        else if (parameter == "Ki") Ki = data;
        else if (parameter == "feedbackOutputLowerBound")
            feedbackOutputLowerBound = data;
        emit ModifyIntParameter(parameter, data);
    }

    function modifyUintParameter(bytes32 parameter, uint256 data)
        external
        isOwner
        isContractEnabled
    {
        if (parameter == "feedbackOutputUpperBound")
            feedbackOutputUpperBound = data;
        else if (parameter == "integralPeriodSize") integralPeriodSize = data;
        else if (parameter == "perSecondCumulativeLeak")
            perSecondCumulativeLeak = data;
        emit ModifyUintParameter(parameter, data);
    }

    // --- PI Specific Math ---
    function riemannSum(int _x, int _y) internal pure returns (int) {
        return (_x + _y) / 2;
    }

    function absolute(int _x) internal pure returns (uint _z) {
        _z = (_x < 0) ? uint(-_x) : uint(_x);
    }

    // --- PI Utils ---

    /*
     * @notice calculates PI output based on provided proportional and integral terms
     * @param _proportionalTerm proportional term in controller
     * @param _integralTerm integral term in controller
     */
    function getGainAdjustedPIOutput(int _proportionalTerm, int _integralTerm)
        public
        view
        returns (int256)
    {
        (int adjustedProportional, int adjustedIntegral) = getGainAdjustedTerms(
            _proportionalTerm,
            _integralTerm
        );
        return adjustedProportional + adjustedIntegral;
    }

    /*
     * @notice calculates proportional and integral term multiplied by coefs
     * @param _proportionalTerm proportional term in controller
     * @param _integralTerm integral term in controller
     */
    function getGainAdjustedTerms(int _proportionalTerm, int _integralTerm)
        public
        view
        returns (int256, int256)
    {
        return (
            (_proportionalTerm * int(Kp)) / int(EIGHTEEN_DECIMAL_NUMBER),
            (_integralTerm * int(Ki)) / int(EIGHTEEN_DECIMAL_NUMBER)
        );
    }

    /*
     * @notice provides new redemption rate by bounding the output of PI controller
     * @param _piOutput output of PI controller
     */
    function getBoundedRedemptionRate(int _piOutput)
        public
        view
        returns (uint256)
    {
        int boundedPIOutput = _piOutput;
        uint newRedemptionRate;

        if (_piOutput < feedbackOutputLowerBound) {
            boundedPIOutput = feedbackOutputLowerBound;
        } else if (_piOutput > int(feedbackOutputUpperBound)) {
            boundedPIOutput = int(feedbackOutputUpperBound);
        }

        bool negativeOutputExceedsHundred = (boundedPIOutput < 0 &&
            -boundedPIOutput >= int(defaultRedemptionRate));
        if (negativeOutputExceedsHundred) {
            newRedemptionRate = NEGATIVE_RATE_LIMIT;
        } else {
            if (
                boundedPIOutput < 0 &&
                boundedPIOutput <= -int(NEGATIVE_RATE_LIMIT)
            ) {
                newRedemptionRate = uint(
                    int(defaultRedemptionRate) + (-int(NEGATIVE_RATE_LIMIT))
                );
            } else {
                newRedemptionRate = uint(
                    int(defaultRedemptionRate) + boundedPIOutput
                );
            }
        }

        return newRedemptionRate;
    }

    /*
     * @notice returns last proportional term
     */
    function getLastProportionalTerm() public view returns (int256) {
        if (oll() == 0) return 0;
        return deviationObservations[oll() - 1].proportional;
    }

    /*
     * @notice returns number of deviation observations
     */
    function oll() public view returns (uint256) {
        return deviationObservations.length;
    }

    /*
     * @notice calculates the integral term
     * @param _proportionalTerm calculated proportional term
     * @param _accumulatedLeak alpha parameter in equation
     */
    function getNextPriceDeviationCumulative(
        int _proportionalTerm,
        uint _accumulatedLeak
    ) public view returns (int256) {
        int256 lastProportionalTerm = getLastProportionalTerm();
        uint256 timeElapsed = (lastUpdateTime == 0)
            ? 0
            : block.timestamp - lastUpdateTime;
        int256 newTimeAdjustedDeviation = riemannSum(
            _proportionalTerm,
            lastProportionalTerm
        ) * int(timeElapsed);
        int256 leakedPriceCumulative = (int(_accumulatedLeak) *
            priceDeviationCumulative) / int(TWENTY_SEVEN_DECIMAL_NUMBER);

        return leakedPriceCumulative + newTimeAdjustedDeviation;
    }

    // --- COMPUTATION ---

    /*
     * @notice calculates new redemption rate based on market and redemption price using PI controller logic
     * @param _marketPrice last recorded market price of NOI
     * @param _redemptionPrice last recorded redemption price of NOI
     * @param _accumulatedLeak alpha parameter in equation
     */
    function computeRate(
        uint _marketPrice,
        uint _redemptionPrice,
        uint _accumulatedLeak
    ) external 
        isContractEnabled 
        isRateSetter 
        returns (uint256) 
    {
        if (block.timestamp - lastUpdateTime < integralPeriodSize) {
            revert AbsPiController__TooSoon();
        }
        int256 proportionalTerm = int(_redemptionPrice) -
            int(_marketPrice) *
            int(10**19);
        updateDeviationHistory(proportionalTerm, _accumulatedLeak);
        lastUpdateTime = block.timestamp;
        int256 piOutput = getGainAdjustedPIOutput(
            proportionalTerm,
            priceDeviationCumulative
        );
        if (piOutput != 0) {
            uint newRedemptionRate = getBoundedRedemptionRate(piOutput);
            return newRedemptionRate;
        } else {
            return TWENTY_SEVEN_DECIMAL_NUMBER;
        }
    }

    /*
     * @notice calculates new integral term and records current deviation
     * @param _marketPrice last recorded market price of NOI
     * @param _proportionalTerm proportional term in controller
     * @param _integralTerm integral term in controller
     */
    function updateDeviationHistory(int proportionalTerm, uint accumulatedLeak)
        internal
    {
        int256 virtualDeviationCumulative = getNextPriceDeviationCumulative(
            proportionalTerm,
            accumulatedLeak
        );
        priceDeviationCumulative = virtualDeviationCumulative;
        deviationObservations.push(
            DeviationObservation(
                block.timestamp,
                proportionalTerm,
                priceDeviationCumulative
            )
        );
    }

    /*
     * @notice returns elapsed time sice last update
     */
    function tlv() external view returns (uint256) {
        uint elapsed = (lastUpdateTime == 0)
            ? 0
            : block.timestamp - lastUpdateTime;
        return elapsed;
    }

    /*
     * @notice returns per second cumulative
     */
    function pscl() external view returns (uint256) {
        return perSecondCumulativeLeak;
    }
}
