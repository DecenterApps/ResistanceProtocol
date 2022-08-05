// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error EthTwapFeed__TimeIntervalDidNotPass();

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

    modifier IntervalPassed() {
        if (block.timestamp - lastUpdateTimestamp < updateTimeInterval)
            revert EthTwapFeed__TimeIntervalDidNotPass();
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
        uint256 _updateTimeInterval,
        uint256 _twapWindowSize,
        address _ethPriceFeed
    ) {
        lastUpdateTimestamp = block.timestamp;

        updateTimeInterval = _updateTimeInterval;
        twapWindowSize = _twapWindowSize + 1;
        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);

        // set initial stuff
        snapshotHistory.push(Snapshot(0, block.timestamp));
        uint256 price = getEthPrice();
        prevEthPrice = price;
        ethTwapPrice = price;
    }

    /*
     * @notice update the cumulative price if minimum interval passed
     */
    function update() public IntervalPassed {
        uint256 timePassed = block.timestamp - lastUpdateTimestamp;

        uint256 nextCumulativeValue = prevCumulativeValue +
            prevEthPrice *
            timePassed;

        Snapshot memory snap;

        // if array is not full get the first snap and push the current
        if (twapWindowSize != snapshotHistory.length) {
            snapshotHistory.push(
                Snapshot(nextCumulativeValue, block.timestamp)
            );
            historyIndx = 0;
            snap = snapshotHistory[0];
        } else {
            snap = snapshotHistory[historyIndx];
            snapshotHistory[historyIndx] = Snapshot(
                nextCumulativeValue,
                block.timestamp
            );
        }

        uint256 tmpEthTwapPrice = (nextCumulativeValue - snap.cumulativeValue) /
            (block.timestamp - snap.timestamp);

        ethTwapPrice = tmpEthTwapPrice;

        // prepare for next iteration
        historyIndx = (historyIndx + 1) % (twapWindowSize - 1);
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
}
