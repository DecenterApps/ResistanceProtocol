// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

error Parameters_NotAuthorized();

contract Parameters{

    uint8 public LR; // LR percentage
    address owner;

    modifier onlyOwner(){
        if (msg.sender != owner)
            revert Parameters_NotAuthorized();
        _;
    }

    constructor()
    {
        owner = msg.sender;
    }

    function getLR() public view onlyOwner returns(uint8){
        return LR;
    }

}