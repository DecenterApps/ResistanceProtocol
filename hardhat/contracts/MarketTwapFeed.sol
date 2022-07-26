// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./RateSetter.sol";
import "./EthTwapFeed.sol";

error MarketTwapFeed__TimeIntervalDidNotPass();
error MarketTwapFeed__NotOwner();
error MarketTwapFeed__NotActive();
error MarketTwapFeed__NotShutdownModule();

abstract contract LendingPoolLike {
    function getReserves()
        public
        view
        virtual
        returns (
            uint256 noiCount,
            uint256 coinCount,
            uint256 timestamp
        );
}

contract MarketTwapFeed {
    uint256 public marketTwapPrice = 0;
    uint256 public immutable updateTimeInterval;
    uint256 public immutable twapWindowSize;

    // hardcode Chainlink NOI/USD Price Feed
    AggregatorV3Interface public coinPriceFeed;
    LendingPoolLike private lendingPool;
    EthTwapFeed private ethTwapFeed;
    RateSetter private rateSetter;

    uint256 private lastUpdateTimestamp;
    uint256 private prevCumulativeValue = 0;
    uint256 private prevPrice;

    bool private active=true;

    struct Snapshot {
        uint256 cumulativeValue;
        uint256 timestamp;
    }

    Snapshot[] private snapshotHistory;
    uint256 private historyIndx = 0;

    event UpdateValues(
        address indexed from,
        uint256 indexed currentPrice,
        uint256 indexed twapPrice,
        uint256 timestamp
    );

    modifier IntervalPassed() {
        if (block.timestamp - lastUpdateTimestamp < updateTimeInterval)
            revert MarketTwapFeed__TimeIntervalDidNotPass();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert MarketTwapFeed__NotOwner();
        _;
    }

    modifier isActive() {
        if (!active)
            revert MarketTwapFeed__NotActive();
        _;
    }

    modifier onlyShutdownModule() {
        if (msg.sender != shutdownModuleContractAddress)
            revert MarketTwapFeed__NotShutdownModule();
        _;
    }

    address shutdownModuleContractAddress;
    address public immutable owner;

    /*
     * @param _updateTimeInterval sets the minimum time interval for update
     * @param _twapWindowSize sets the number of updates needed for twap to change
     * @param _lendongPool get the oracle
     */
    constructor(
        uint256 _updateTimeInterval,
        uint256 _twapWindowSize,
        address _lendingPool,
        address _ethTwapFeed,
        address _rateSetter,
        address _coinPriceFeed,
        address _owner
    ) {
        owner=_owner;
        lastUpdateTimestamp = block.timestamp;

        coinPriceFeed = AggregatorV3Interface(_coinPriceFeed);
        // dai contract
        //0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9

        updateTimeInterval = _updateTimeInterval;
        twapWindowSize = _twapWindowSize;
        lendingPool = LendingPoolLike(_lendingPool);
        ethTwapFeed = EthTwapFeed(_ethTwapFeed);
        rateSetter = RateSetter(_rateSetter);

        // set initial stuff
        uint256 price = getMarketPrice();
        prevPrice = price;
        marketTwapPrice = price;

        uint256 timeTmp = block.timestamp -
            _updateTimeInterval *
            _twapWindowSize;

        uint256 cumulativeVal = 0;

        for (uint256 i = 0; i < _twapWindowSize; i++) {
            cumulativeVal = cumulativeVal + price * _updateTimeInterval;
            snapshotHistory.push(
                Snapshot(
                    cumulativeVal,
                    timeTmp + _updateTimeInterval * (i + 1)
                )
            );
        }
        prevCumulativeValue = cumulativeVal;
    }

    /*
     * @notice update the cumulative price if minimum interval passed
     */
    function update() public IntervalPassed isActive {
        uint256 timePassed = block.timestamp - lastUpdateTimestamp;

        uint256 nextCumulativeValue = prevCumulativeValue +
            prevPrice *
            timePassed;

        // get past snap and set the new cumulative value
        Snapshot memory snap = snapshotHistory[historyIndx];
        snapshotHistory[historyIndx] = Snapshot(
            nextCumulativeValue,
            block.timestamp
        );

        uint256 tmpMarketTwapPrice = (nextCumulativeValue -
            snap.cumulativeValue) / (block.timestamp - snap.timestamp);

        marketTwapPrice = tmpMarketTwapPrice;

        // prepare for next iteration
        historyIndx = (historyIndx + 1) % twapWindowSize;
        prevCumulativeValue = nextCumulativeValue;
        uint256 marketPrice = getMarketPrice();
        prevPrice = marketPrice;
        lastUpdateTimestamp = block.timestamp;

        //update ethTwapFeed Contract
        uint256 ethTwap = ethTwapFeed.updateAndGetTwap();

        //update prices in rateSetter
        rateSetter.updatePrices(ethTwap, tmpMarketTwapPrice);

        emit UpdateValues(
            msg.sender,
            marketPrice,
            tmpMarketTwapPrice,
            block.timestamp
        );
    }

    /*
     * @notice fetch the most recent market twap
     */
    function getTwap() public view returns (uint256) {
        return marketTwapPrice;
    }

    function setShutdownModuleContractAddress(address _addr) external onlyOwner{
        shutdownModuleContractAddress = _addr;
    }

    /*
     * @notice calculate the market price
     */
    function getMarketPrice() public view returns (uint256) {
        (uint256 noiCount, uint256 coinCount, ) = lendingPool.getReserves();

        uint256 coinPrice = getCoinPrice();

        return (coinPrice * coinCount) / noiCount;
    }

    /*
     * @notice get coin price in usd
     */
    function getCoinPrice() public view returns (uint256) {
        (, int256 price, , , ) = coinPriceFeed.latestRoundData();
        return uint256(price);
    }

    function shutdown() public onlyShutdownModule{
        active = false;
    }
}
