// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./NOI.sol";

error Treasury__NotAuthorized();
error Treasury__NotOwner();
error Treasury__NotEnoughFunds();
error Treasury__TransactionFailed();
error Treasury__UnauthorizedCDPManager();
error Treasury__UnauthorizedShutdownModule();
error Treasury__NotEnoughNOIForReedem();

contract Treasury {
    address public immutable owner;
    mapping(address => bool) userAuthorized;

    address CDPManagerContractAddress;
    address ShutdownModuleContractAddress;
    address NOIContractAddress;

    uint256 public unmintedNoiBalance = 0;
    uint256 public noiForRedeem = 0;

    event TreasuryReceiveNOI(uint256 _amount);
    event TreasuryReceiveReedemableNOI(uint256 _amount);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Treasury__NotOwner();
        _;
    }

    modifier onlyAuthorized() {
        if (userAuthorized[msg.sender] == false)
            revert Treasury__NotAuthorized();
        _;
    }

    modifier onlyCDPManagerContract() {
        if (msg.sender != CDPManagerContractAddress)
            revert Treasury__UnauthorizedCDPManager();
        _;
    }

    modifier onlyShutdownModuleContract() {
        if (msg.sender != ShutdownModuleContractAddress)
            revert Treasury__UnauthorizedShutdownModule();
        _;
    }

    constructor(address _owner) {
        owner = _owner;
        userAuthorized[owner] = true;
    }

    function addAuthorization(address _to) public onlyOwner {
        userAuthorized[_to] = true;
    }

    function removeAuthorization(address _from) public onlyOwner {
        userAuthorized[_from] = false;
    }

    function setNOIContractAddress(address _NOIContractAddress)
        public
        onlyOwner
    {
        NOIContractAddress = _NOIContractAddress;
    }

    function setCDPManagerContractAddress(address _CDPManagerContractAddress)
        public
        onlyOwner
    {
        CDPManagerContractAddress = _CDPManagerContractAddress;
    }

    function setShutdownModuleContractAddress(address _ShutdownModuleContractAddress)
        public
        onlyOwner
    {
        ShutdownModuleContractAddress = _ShutdownModuleContractAddress;
    }

    /*
     * @notice sends requested funds to an authorized user
     * @param _amount amount of ETH requested
     */
    function getFunds(uint256 _amount) public onlyAuthorized {
        if (getBalanceOfTreasury() < _amount) revert Treasury__NotEnoughFunds();

        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        if (sent == false) revert Treasury__TransactionFailed();
    }

    function getBalanceOfTreasury() public view returns (uint256) {
        return address(this).balance;
    }

    function receiveUnmintedNoi(uint256 _amount) public onlyCDPManagerContract {
        unmintedNoiBalance += _amount;
        emit TreasuryReceiveNOI(_amount);
    }

    function receiveRedeemableNoi(uint256 _amount) public onlyShutdownModuleContract {
        noiForRedeem += _amount;
        emit TreasuryReceiveReedemableNOI(_amount);
    }

    function reedemNoiForCollateral(uint256 _amount,address _to,uint256 _ethRp) public onlyShutdownModuleContract{
        if(_amount>noiForRedeem)
            revert Treasury__NotEnoughNOIForReedem();
        NOI(NOIContractAddress).burn(_to,_amount);
        noiForRedeem-=_amount;
        uint256 col=_amount/_ethRp;
        (bool sent, ) = payable(_to).call{value: col}("");
        if (sent == false) revert Treasury__TransactionFailed();

        //NOI_COIN.burn(msg.sender, onlyDebt);
    }

    receive() external payable {}
}
