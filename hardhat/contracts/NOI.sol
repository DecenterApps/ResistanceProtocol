// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

error NOI__NotAuthorized();
error NOI__InvalidDestination();
error NOI__InsufficientBalance();
error NOI__InsufficientAllowance();

contract NOI {
    // --- Auth ---
    mapping(address => bool) public authorizedAccounts;

    function addAuthorization(address account) external isAuthorized {
        authorizedAccounts[account] = 1;
        emit AddAuthorization(account);
    }

    function removeAuthorization(address account) external isAuthorized {
        authorizedAccounts[account] = 0;
        emit RemoveAuthorization(account);
    }

    modifier isAuthorized() {
        if (authorizedAccounts[msg.sender] == false)
            revert NOI__NotAuthorized();
        _;
    }

    // The name of this coin
    string public name;
    // The symbol of this coin
    string public symbol;
    // The version of this Coin contract
    string public version = "1";
    // The number of decimals that this coin has
    uint8 public constant decimals = 18;

    // The id of the chain where this coin was deployed
    uint256 public chainId;
    // The total supply of this coin
    uint256 public totalSupply;

    // Mapping of coin balances
    mapping(address => uint256) public balanceOf;
    // Mapping of allowances
    mapping(address => mapping(address => uint256)) public allowance;
    // Mapping of nonces used for permits
    mapping(address => uint256) public nonces;

    // --- Events ---
    event AddAuthorization(address account);
    event RemoveAuthorization(address account);
    event Approval(address indexed src, address indexed guy, uint256 amount);
    event Transfer(address indexed src, address indexed dst, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _chainId
    ) public {
        authorizedAccounts[msg.sender] = true;
        name = _name;
        symbol = _symbol;
        chainId = _chainId;
        emit AddAuthorization(msg.sender);
    }

    /*
     * @notice Transfer coins to another address
     * @param dst The address to transfer coins to
     * @param amount The amount of coins to transfer
     */
    function transfer(address dst, uint256 amount) external returns (bool) {
        return transferFrom(msg.sender, dst, amount);
    }

    /*
     * @notice Transfer coins from a source address to a destination address (if allowed)
     * @param src The address from which to transfer coins
     * @param dst The address that will receive the coins
     * @param amount The amount of coins to transfer
     */
    function transferFrom(
        address src,
        address dst,
        uint256 amount
    ) public returns (bool) {
        if (dst == address(0) || dst == address(this))
            revert NOI__InvalidDestination();
        if (balanceOf[src] < amount) revert NOI__InsufficientBalance();
        if (src != msg.sender) {
            if(allowance[src][msg.sender] < amount)
                revert NOI__InsufficientAllowance()
            allowance[src][msg.sender] = allowance[src][msg.sender] - amount;
        }
        balanceOf[src] = balanceOf[src] - amount;
        balanceOf[dst] = balanceOf[dst] + amount;
        emit Transfer(src, dst, amount);
        return true;
    }

    /*
     * @notice Mint new coins
     * @param usr The address for which to mint coins
     * @param amount The amount of coins to mint
     */
    function mint(address usr, uint256 amount) external isAuthorized {
        balanceOf[usr] = balanceOf[usr] + amount;
        totalSupply = totalSupply + amount;
        emit Transfer(address(0), usr, amount);
    }

    /*
     * @notice Burn coins from an address
     * @param usr The address that will have its coins burned
     * @param amount The amount of coins to burn
     */
    function burn(address usr, uint256 amount) external {
        if(balanceOf[usr] < amount) revert NOI__InsufficientBalance();
        if (usr != msg.sender) {
            if(allowance[usr][msg.sender] < amount) 
                revert NOI__InsufficientAllowance();
            allowance[usr][msg.sender] = allowance[usr][msg.sender] - amount
        }
        balanceOf[usr] = balanceOf[usr] - amount;
        totalSupply = totalSupply - amount
        emit Transfer(usr, address(0), amount);
    }

    /*
     * @notice Change the transfer/burn allowance that another address has on your behalf
     * @param usr The address whose allowance is changed
     * @param amount The new total allowance for the usr
     */
    function approve(address usr, uint256 amount) external returns (bool) {
        allowance[msg.sender][usr] = amount;
        emit Approval(msg.sender, usr, amount);
        return true;
    }
}
