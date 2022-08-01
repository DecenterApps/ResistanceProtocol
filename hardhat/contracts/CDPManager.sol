// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./NOI.sol";
import "./Parameters.sol";
import "hardhat/console.sol";

error CDPManager__OnlyOwnerAuthorization();
error CDPManager__UnauthorizedLiquidator();
error CDPManager__NotAuthorized();
error CDPManager__ContractNotAuthorized();
error CDPManager__NotOwner();
error CDPManager__HasDebt();
error CDPManager__LiquidationRatioReached();
error CDPManager__ZeroTokenMint();


contract CDPManager {
    struct CDP {
        // Total amount of collateral locked in a CDP
        uint256 lockedCollateral; // [wad]
        // Total amount of debt generated by a CDP
        uint256 generatedDebt; // [wad]
        // Address of owner
        address owner;
        // accumulated stability fee before changing generatedDebt amount
        uint256 accumulatedFee;
        // time of last calculation of accumulated stability fee
        uint256 updatedTime;
    }

    uint256 private totalSupply;
    uint256 public cdpi; // auto increment index for CDPs
    mapping(uint256 => CDP) private cdpList; // CDPId => CDP

    NOI private immutable NOI_COIN;
    uint256 ethRp; // ETH/RP rate
    uint256 liquidationRatio;

    address liquidatorContractAddress;
    address parametersContractAddress;

    address public owner;

    modifier onlyOwner(){
        if(msg.sender != owner) revert CDPManager__OnlyOwnerAuthorization();
        _;
    }

    modifier onlyLiquidatorContract(){
        if(msg.sender != liquidatorContractAddress) revert CDPManager__UnauthorizedLiquidator();
        _;
    }
    uint256 internal constant TWENTY_SEVEN_DECIMAL_NUMBER = 10**27;
    uint256 internal constant EIGHTEEN_DECIMAL_NUMBER = 10**18;

    modifier HasAccess(address _user) {
        if(msg.sender != _user) revert CDPManager__NotAuthorized();
        _;
    }

    // EVENTS

    event CDPOpen(address indexed _user,uint256 indexed _cdpId, uint _value);
    event TransferCollateral(address indexed _user,uint256 indexed _cdpId, uint _value);
    event CDPClose(address indexed _user,uint256 indexed _cdpId);
    event OwnershipTransfer(address indexed _from,address indexed _to,uint256 indexed _cdpId);
    event MintCDP(address indexed _from,uint256 indexed _cdpId, uint _amount);
    event RepayCDP(address indexed _from,uint256 indexed _cdpId, uint _amount);
    event AddAuthorization(address _account);
    event RemoveAuthorization(address _account);

    // --- Auth ---
    mapping(address => bool) public authorizedAccounts;

    function addAuthorization(address account) external isOwner {
        authorizedAccounts[account] = true;
        emit AddAuthorization(account);
    }

    function removeAuthorization(address account) external isOwner {
        authorizedAccounts[account] = false;
        emit RemoveAuthorization(account);
    }

    modifier isOwner() {
        if (owner != msg.sender)
            revert CDPManager__NotOwner();
        _;
    }

    modifier isAuthorized() {
        if (authorizedAccounts[msg.sender] == false)
            revert CDPManager__ContractNotAuthorized();
        _;
    }

    constructor(address _noiCoin) {
        owner = msg.sender;
        authorizedAccounts[msg.sender] = true;
        totalSupply = 0;
        cdpi = 0;
        NOI_COIN = NOI(_noiCoin);
        ethRp = 1000 * EIGHTEEN_DECIMAL_NUMBER;
        liquidationRatio = 120 * EIGHTEEN_DECIMAL_NUMBER / 100;
    }

    function setLiquidatorContractAddress(address _liquidatorContractAddress) public onlyOwner{
        liquidatorContractAddress = _liquidatorContractAddress;
    }

    function setParametersContractAddress(address _parametersContractAddress) public onlyOwner{
        parametersContractAddress = _parametersContractAddress;
    } 

    /*
     * @notice open a new cdp for a given _user address
     * @param _user address of cdp owner
     */
    function openCDP(address _user) public payable HasAccess(_user) returns (uint256){
        cdpi = cdpi + 1;
        cdpList[cdpi] = CDP(msg.value, 0, _user,0,block.timestamp);
        totalSupply = totalSupply + msg.value;

        emit CDPOpen(_user,cdpi,msg.value);
        return cdpi;
    }

    /*
     * @notice adds collateral to an existing CDP
     * @param _cdpIndex index of cdp
     */
    function transferCollateralToCDP(uint _cdpIndex) public payable {
        cdpList[_cdpIndex].lockedCollateral =
            cdpList[_cdpIndex].lockedCollateral +
            msg.value;
        totalSupply = totalSupply + msg.value;
        emit TransferCollateral(cdpList[_cdpIndex].owner,_cdpIndex,msg.value);
    }

    /*
     * @notice close CDP if you have 0 debt
     * @param _cdpIndex index of cdp
     */
    function closeCDP(uint256 _cdpIndex) public HasAccess(cdpList[_cdpIndex].owner){
        if (cdpList[_cdpIndex].generatedDebt != 0) {
            revert CDPManager__HasDebt();
        }
        (bool sent, ) = payable(cdpList[_cdpIndex].owner).call{
            value: cdpList[_cdpIndex].lockedCollateral
        }("");
        if (sent == false) revert();
        totalSupply = totalSupply - cdpList[_cdpIndex].lockedCollateral;
        emit CDPClose(cdpList[_cdpIndex].owner,_cdpIndex);
        delete cdpList[_cdpIndex];
    }

    /*
     * @notice view total supply of ether in contract
     */
    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    /*
     * @notice view the state of one CDP
     * @param _cdpIndex index of cdp
     */
    function getOneCDP(uint256 _cdpIndex)
        public
        view
        returns (CDP memory searchedCDP)
    {
        searchedCDP = cdpList[_cdpIndex];
    }

    /*
     * @notice transfer ownership of CDP
     * @param _from address of owner
     * @param _to address of new owner
     * @param _cdpIndex index of cdp
     */
    function transferOwnership(address _from,address _to,uint256 _cdpIndex) public HasAccess(_from){
        cdpList[_cdpIndex].owner=_to;
        emit OwnershipTransfer(_from,_to,_cdpIndex);
    }

    /*
     * @notice mint coins for cdp 
     * @param _cdpIndex index of cdp
     * @param _amount amount of tokens to mint
     */
    function mintFromCDP(uint256 _cdpIndex, uint256 _amount) public HasAccess(cdpList[_cdpIndex].owner) {
        if(_amount == 0)
            revert CDPManager__ZeroTokenMint();
        CDP memory user_cdp = cdpList[_cdpIndex];

        console.log("AMOUNT: ",_amount," GENERATED DEBT: ",user_cdp.generatedDebt);
        // check if the new minted coins will be under liquidation ratio
        uint256 newTotalDebt = (user_cdp.generatedDebt + _amount) * liquidationRatio;
        if(newTotalDebt >= ethRp * user_cdp.lockedCollateral) 
            revert CDPManager__LiquidationRatioReached();

        cdpList[_cdpIndex].generatedDebt += _amount;

        NOI_COIN.mint(user_cdp.owner, _amount);
        emit MintCDP(cdpList[_cdpIndex].owner,_cdpIndex,_amount);
    }

    /*
     * @notice repay debt in coins
     * @param _cdpIndex index of cdp
     * @param _amount amount of tokens to repay
     */
    function repayToCDP(uint256 _cdpIndex, uint256 _amount) public HasAccess(cdpList[_cdpIndex].owner){
        NOI_COIN.burn(cdpList[_cdpIndex].owner, _amount);
        cdpList[_cdpIndex].generatedDebt -= _amount;
        emit RepayCDP(cdpList[_cdpIndex].owner,_cdpIndex,_amount);
    }

    function liquidatePosition(uint _cdpIndex) public payable onlyLiquidatorContract {
        
        (bool sent, ) = payable(msg.sender).call{
            value: cdpList[_cdpIndex].lockedCollateral
        }("");
        if (sent == false) revert();
        totalSupply = totalSupply - cdpList[_cdpIndex].lockedCollateral;
        emit CDPClose(cdpList[_cdpIndex].owner,_cdpIndex);
        delete cdpList[_cdpIndex];
    }

    /*
     * @notice update ETH/RP value
     * @param _ethrp new value
     */
    function updateValue(uint _ethrp) external isAuthorized{
        ethRp = _ethrp;
    }



}
