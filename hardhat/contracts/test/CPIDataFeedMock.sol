// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

contract CPIDataFeedMock {

    uint256 public cpi;

    constructor(uint256 _cpi) {
        cpi = _cpi;
    }

    function setCpi(uint256 _cpi) public {
        cpi = _cpi;
    }

    function currPegPrice() external view returns (uint256) {
        return cpi;
    }
}