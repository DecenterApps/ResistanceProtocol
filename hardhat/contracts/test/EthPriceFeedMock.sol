// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

//import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";

contract EthPriceFeedMock {
    int256 public price;
    uint80 public round = 0;

    constructor(int256 _price) public {
        price = _price;
    }

    function setPrice(int256 _price) public {
        price = _price;
        round += 1;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (round, price, 0, 0, 0);
    }
}
