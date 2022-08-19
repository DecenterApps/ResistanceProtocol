// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

error Parameters_NotAuthorized();

contract Parameters{

    uint8 public LR=120; // Liquidation Ratio percentage
    uint8 public SF=2; // Stability Fee percentage
    uint16 public globalCRLimit=130; // Global CR limit percentage
    address public immutable owner;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Parameters_NotAuthorized();
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    function setLR(uint8 _LR) public onlyOwner {
        LR = _LR;
    }

    function setSF(uint8 _SF) public onlyOwner {
        SF = _SF;
    }

    function setGlobalCRLimit(uint16 _globalCRLimit) public {
        globalCRLimit = _globalCRLimit;
    }

    function getSF() public view returns (uint8) {
        return SF;
    }

    function getLR() public view returns (uint8) {
        return LR;
    }

    function getGlobalCRLimit() public view returns (uint16) {
        return globalCRLimit;
    }

}
