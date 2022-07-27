// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

error Parameters_NotAuthorized();

contract Parameters{

    uint8 public LR=120; // Liquidation Ratio percentage
    uint8 public SF; // Stability Fee percentage
    address owner;

    modifier onlyOwner(){
        if (msg.sender != owner)
            revert Parameters_NotAuthorized();
        _;
    }

    constructor(){
        owner = msg.sender;
    }


    function setLR(uint8 _LR) public onlyOwner{
        LR = _LR;
    }

    function getLR() public view returns(uint8){
        return LR;
    }

   function setSF(uint8 _SF) public onlyOwner{
        SF = _SF;
    }

    function getSF() public view returns(uint8){
        return SF;
    }


}