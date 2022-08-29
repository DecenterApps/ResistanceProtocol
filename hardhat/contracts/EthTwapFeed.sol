// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error EthTwapFeed__TimeIntervalDidNotPass();
error EthTwapFeed__NotMarketTwapFeed();
error EthTwapFeed__NotAuthorized();
error EthTwapFeed__NotOwner();
error EthTwapFeed__NotActive();

contract EthTwapFeed {
    uint256 public ethTwapPrice = 0;
    uint256 public immutable updateTimeInterval;
    uint256 public immutable twapWindowSize;

    AggregatorV3Interface private immutable ethPriceFeed;
    uint256 private lastUpdateTimestamp;
    uint256 private prevCumulativeValue = 0;
    uint256 private prevEthPrice;

    struct Snapshot {
        uint256 cumulativeValue;
        uint256 timestamp;
    }

    Snapshot[] private snapshotHistory;
    uint256 private historyIndx = 0;

    bool private active=true;

    modifier IntervalPassed() {
        if (block.timestamp - lastUpdateTimestamp < updateTimeInterval)
            revert EthTwapFeed__TimeIntervalDidNotPass();
        _;
    }

    modifier isOwner() {
        if (msg.sender != owner) revert EthTwapFeed__NotOwner();
        _;
    }

    modifier isActive() {
        if (!active)
            revert EthTwapFeed__NotActive();
        _;
    }

    mapping(address => bool) public authorizedAccounts;
    address public immutable owner;

    function addAuthorization(address account) external isOwner {
        authorizedAccounts[account] = true;
    }

    function removeAuthorization(address account) external isOwner {
        authorizedAccounts[account] = false;
    }

    modifier isAuthorized() {
        if (authorizedAccounts[msg.sender] == false)
            revert EthTwapFeed__NotAuthorized();
        _;
    }

    event UpdateValues(
        address indexed from,
        uint256 indexed ethCurrentPrice,
        uint256 indexed ethTwapPrice,
        uint256 timestamp
    );

    /*
     * @param _updateTimeInterval sets the minimum time interval for update
     * @param _twapWindowSize sets the number of updates needed for twap to change
     * @param _ethPriceFeed sets the chainlink price feed oracle
     */
    constructor(
        address _owner,
        uint256 _updateTimeInterval,
        uint256 _twapWindowSize,
        address _ethPriceFeed
    ) {
        owner = _owner;
        lastUpdateTimestamp = block.timestamp;

        updateTimeInterval = _updateTimeInterval;
        twapWindowSize = _twapWindowSize;
        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);

        uint256 price = getEthPrice();
        prevEthPrice = price;
        ethTwapPrice = price;

        uint256 timeTmp = block.timestamp -
            _updateTimeInterval *
            _twapWindowSize;

        uint256 cumulativeVal = 0;

        for (uint256 i = 0; i < _twapWindowSize; i++) {
            cumulativeVal = cumulativeVal + price * _updateTimeInterval;
            snapshotHistory.push(
                Snapshot(cumulativeVal, timeTmp + _updateTimeInterval * (i + 1))
            );
        }
        prevCumulativeValue = cumulativeVal;
    }

    /*
     * @notice update the cumulative price if minimum interval passed
     */
    function updateAndGetTwap()
        public
        IntervalPassed
        isAuthorized
        isActive
        returns (uint256)
    {
        uint256 timePassed = block.timestamp - lastUpdateTimestamp;

        uint256 nextCumulativeValue = prevCumulativeValue +
            prevEthPrice *
            timePassed;

        Snapshot memory snap = snapshotHistory[historyIndx];
        snapshotHistory[historyIndx] = Snapshot(
            nextCumulativeValue,
            block.timestamp
        );

        uint256 tmpEthTwapPrice = (nextCumulativeValue - snap.cumulativeValue) /
            (block.timestamp - snap.timestamp);

        ethTwapPrice = tmpEthTwapPrice;

        // prepare for next iteration
        historyIndx = (historyIndx + 1) % twapWindowSize;
        prevCumulativeValue = nextCumulativeValue;
        uint256 currentEthPrice = getEthPrice();
        prevEthPrice = currentEthPrice;
        lastUpdateTimestamp = block.timestamp;
        emit UpdateValues(
            msg.sender,
            currentEthPrice,
            tmpEthTwapPrice,
            block.timestamp
        );
        return tmpEthTwapPrice;
    }

    /*
     * @notice fetch the most recent eth Twap
     */
    function getTwap() public view returns (uint256) {
        return ethTwapPrice;
    }

    /*
     * @notice fetch the eth price from chainlink oracle
     */
    function getEthPrice() public view returns (uint256) {
        // price has 1e8 decimal points!
        (, int256 price, , , ) = ethPriceFeed.latestRoundData();
        return uint256(price); // cast to uint because it can be negative?
    }

    function shutdown()public isAuthorized{
        active=false;
    }
}
