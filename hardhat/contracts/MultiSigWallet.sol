// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

error MultiSigWallet__NotOwner();
error MultiSigWallet__txDoesntExist();
error MultiSigWallet__txAlreadyExecuted();
error MultiSigWallet__txAlreadyConfirmed();
error MultiSigWallet__OwnersRequired();
error MultiSigWallet__InvalidOwner();
error MultiSigWallet__UniqueOwner();
error MultiSigWallet__CannotExecuteTx();
error MultiSigWallet__txFailed();
error MultiSigWallet__txNotConfirmed();

contract MultiSigWallet {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    mapping(address => bool) public owners;
    uint256 public ownersNumber;

    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    Transaction[] public transactions;

    //EVENTS

    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    //MODIFIERS

    modifier onlyOwner() {
        if (owners[msg.sender] == false) revert MultiSigWallet__NotOwner();
        _;
    }

    modifier txExists(uint256 _txIndex) {
        if (_txIndex >= transactions.length)
            revert MultiSigWallet__txDoesntExist();
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        if (transactions[_txIndex].executed)
            revert MultiSigWallet__txAlreadyExecuted();
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        if (isConfirmed[_txIndex][msg.sender])
            revert MultiSigWallet__txAlreadyConfirmed();
        _;
    }

    modifier approvedByMajority(uint256 _numConfirmations) {
        if (_numConfirmations <= ownersNumber / 2)
            revert MultiSigWallet__CannotExecuteTx();
        _;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    constructor(address[] memory _owners) {
        if (_owners.length == 0) revert MultiSigWallet__OwnersRequired();

        uint256 ownersNum = 0;

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            if (owner == address(0)) revert MultiSigWallet__InvalidOwner();
            if (owners[owner]) revert MultiSigWallet__UniqueOwner();

            owners[owner] = true;
            ownersNum += 1;
        }

        ownersNumber = ownersNum;
    }

    /*
     * @notice submit a tx to be evaluated
     * @param _to tx destination address
     * @param _value tx send value
     * @param _data calldata of the tx
     */
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner {
        uint256 txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    /*
     * @notice confirm tx as a owner
     * @param _txIndex index of the pending tx
     */
    function confirmTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    /*
     * @notice execute the tx that has been approved by the majority
     * @param _txIndex index of the pending tx
     */
    function executeTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        approvedByMajority(transactions[_txIndex].numConfirmations)
    {
        Transaction storage transaction = transactions[_txIndex];

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        if (!success) revert MultiSigWallet__txFailed();

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    /*
     * @notice revoke the tx confirmation
     * @param _txIndex index of the pending tx
     */
    function revokeConfirmation(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        if (!isConfirmed[_txIndex][msg.sender])
            revert MultiSigWallet__txNotConfirmed();

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    /*
     * @notice kick a owner from the owners array
     * @param _owner address of the owner to kick
     */
    function kickOwner(address _owner) private {
        if (!owners[_owner]) revert MultiSigWallet__InvalidOwner();
        delete owners[_owner];
        ownersNumber -= 1;
    }

    /*
     * @notice add a owner from the owners array
     * @param _owner address of the owner to add
     */
    function addOwner(address _owner) private {
        if (owners[_owner]) revert MultiSigWallet__InvalidOwner();
        owners[_owner] = true;
        ownersNumber += 1;
    }

    /*
     * @notice get the pending tx
     * @param _txIndex index of the pending tx
     */
    function getTransaction(uint256 _txIndex)
        public
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        )
    {
        Transaction memory transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
}
