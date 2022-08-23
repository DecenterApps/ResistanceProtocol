// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IRedemptionRateController{
    function computeRate(
        uint256 _marketValue,
        uint256 _redemptionValue,
        uint256 _accumulatedLeak
    ) external returns (uint256);
}