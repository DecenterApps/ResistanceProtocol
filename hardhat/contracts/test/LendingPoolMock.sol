// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract LendingPoolMock {
    uint256 public token1Cnt;
    uint256 public token2Cnt;

    constructor(uint256 _token1, uint256 _token2) {
        token1Cnt = _token1;
        token2Cnt = _token2;
    }

    function setToken1(uint256 _token) public {
        token1Cnt = _token;
    }

    function setToken2(uint256 _token) public {
        token2Cnt = _token;
    }

    function getReserves()
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (token1Cnt, token2Cnt, block.timestamp);
    }
}
