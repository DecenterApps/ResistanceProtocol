// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

error AbsPiController__NotAuthorized();
error AbsPiController__NotOwner();
error AbsPiController__TooSoon();

contract AbsPiController {
    // --- Auth ---
    mapping(address => bool) public authorizedAccounts;
    address private owner;

    function addAuthorization(address account) external isOwner {
        authorizedAccounts[account] = true;
        emit AddAuthorization(account);
    }

    function removeAuthorization(address account) external isOwner {
        authorizedAccounts[account] = false;
        emit RemoveAuthorization(account);
    }

    modifier isOwner() {
        if (owner != msg.sender) revert AbsPiController__NotOwner();
        _;
    }

    modifier isAuthorized() {
        if (authorizedAccounts[msg.sender] == false)
            revert AbsPiController__NotAuthorized();
        _;
    }

    // EVENTS

    event AddAuthorization(address _account);
    event RemoveAuthorization(address _account);

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
    uint256 internal lastUpdateTime; // [timestamp]

    uint256 internal constant NEGATIVE_RATE_LIMIT =
        TWENTY_SEVEN_DECIMAL_NUMBER - 1;
    uint256 internal constant TWENTY_SEVEN_DECIMAL_NUMBER = 10**27;
    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;

    constructor(
        int256 _Kp,
        int256 _Ki,
        uint256 _feedbackOutputUpperBound,
        int256 _feedbackOutputLowerBound,
        uint256 _integralPeriodSize
    ) {
        defaultRedemptionRate = TWENTY_SEVEN_DECIMAL_NUMBER;
        owner = msg.sender;
        authorizedAccounts[msg.sender] = true;
        Kp = _Kp;
        Ki = _Ki;
        feedbackOutputUpperBound = _feedbackOutputUpperBound;
        feedbackOutputLowerBound = _feedbackOutputLowerBound;
        integralPeriodSize=_integralPeriodSize;
    }

    // --- PI Specific Math ---
    function riemannSum(int x, int y) internal pure returns (int z) {
        return (x + y) / 2;
    }

    function absolute(int x) internal pure returns (uint z) {
        z = (x < 0) ? uint(-x) : uint(x);
    }

    // --- PI Utils ---
    function getGainAdjustedPIOutput(int proportionalTerm, int integralTerm)
        public
        view
        returns (int256)
    {
        (int adjustedProportional, int adjustedIntegral) = getGainAdjustedTerms(
            proportionalTerm,
            integralTerm
        );
        return adjustedProportional + adjustedIntegral;
    }

    function getGainAdjustedTerms(int proportionalTerm, int integralTerm)
        public
        view
        returns (int256, int256)
    {
        return (
            (proportionalTerm * int(Kp)) / int(EIGHTEEN_DECIMAL_NUMBER),
            (integralTerm * int(Ki)) / int(EIGHTEEN_DECIMAL_NUMBER)
        );
    }

    function getBoundedRedemptionRate(int piOutput)
        public
        view
        returns (uint256)
    {
        int boundedPIOutput = piOutput;
        uint newRedemptionRate;

        if (piOutput < feedbackOutputLowerBound) {
            boundedPIOutput = feedbackOutputLowerBound;
        } else if (piOutput > int(feedbackOutputUpperBound)) {
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

    function getLastProportionalTerm() public view returns (int256) {
        if (oll() == 0) return 0;
        return deviationObservations[oll() - 1].proportional;
    }

    function oll() public view returns (uint256) {
        return deviationObservations.length;
    }

    function getNextPriceDeviationCumulative(
        int proportionalTerm,
        uint accumulatedLeak
    ) public view returns (int256) {
        int256 lastProportionalTerm = getLastProportionalTerm();
        uint256 timeElapsed = (lastUpdateTime == 0)
            ? 0
            : block.timestamp - lastUpdateTime;
        int256 newTimeAdjustedDeviation = riemannSum(
            proportionalTerm,
            lastProportionalTerm
        ) * int(timeElapsed);
        int256 leakedPriceCumulative = (int(accumulatedLeak) *
            priceDeviationCumulative) / int(TWENTY_SEVEN_DECIMAL_NUMBER);

        return leakedPriceCumulative + newTimeAdjustedDeviation;
    }

    // --- COMPUTATION ---

    function computeRate(
        uint marketPrice,
        uint redemptionPrice,
        uint accumulatedLeak
    ) external returns (uint256) {
        if (
            block.timestamp - lastUpdateTime >= integralPeriodSize ||
            lastUpdateTime == 0
        ) {
            revert AbsPiController__TooSoon();
        }
        int256 proportionalTerm = int(redemptionPrice) -
            int(marketPrice) *
            int(10**9);
        updateDeviationHistory(proportionalTerm, accumulatedLeak);
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
}
