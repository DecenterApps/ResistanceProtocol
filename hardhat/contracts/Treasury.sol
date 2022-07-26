// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

error Treasury_NotAuthorized();
error Treasury_NotOwner();
error Treasury_NotEnoughFunds();
error Treasury_TransactionFailed();

contract Treasury{

    address private owner;
    mapping (address => bool) userAuthorized;



    modifier onlyOwner {
        if (msg.sender != owner) revert Treasury_NotOwner();
        _;
    }

    modifier onlyAuthorized {
        if (userAuthorized[msg.sender] == false) revert Treasury_NotAuthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
        userAuthorized[owner] = true;
    }



    function addAuthorization(address _to) public onlyOwner {
        userAuthorized[_to] = true;
    }

    function removeAuthorization(address _from) public onlyOwner {
        userAuthorized[_from] = false;
    }

    /*
     * @notice sends requested funds to an authorized user
     * @param _amount amount of ETH requested
     */
    function getFunds(uint256 _amount) public onlyAuthorized {
        if ( getBalanceOfTreasury() < _amount ) revert Treasury_NotEnoughFunds();

        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        if (sent == false) revert Treasury_TransactionFailed();
    }

    function getBalanceOfTreasury() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}

}