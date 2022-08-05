// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "./interfaces/Interfaces-ExchangePool.sol";

contract ExchangePool {
    address poolRouterAddr;
    address poolAddr;
    address poolFactoryAddr;

    address noiAddr;
    address daiAddr;

    uint constant scale = 10**18;
    uint constant MAX_UINT = 2**256 - 1;

    constructor(address _noiAddr) {
        poolRouterAddr = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; //both mainnet & kovan address
        poolFactoryAddr = IRouter02(poolRouterAddr).factory();
        daiAddr = 0x6B175474E89094C44Da98b954EedeAC495271d0F; //mainnet address (kovan address is different)
        noiAddr = _noiAddr;

        poolAddr = IFactory(poolFactoryAddr).createPair(daiAddr, noiAddr);
    }

    function getRouterAddress() public view returns (address routerAddress) {
        return poolRouterAddr;
    }

    function getReserves()
        public
        returns (
            uint112 _reserve0,
            uint112 _reserve1,
            uint32 _blockTimestampLast
        )
    {
        return IPool(poolAddr).getReserves();
    }

    /*
    Provides liquidity to exchange pool. Simplified version of the Router "addLiquidity", in the following aspects:
        - Parameters 5 & 6 are minimum amount of tokens able to be provided without the transactoin reverting; could be set up via the percentError, but for 
          simplicity its 0 here
        - Last parameter is the time the function has before reverting; here, the time is unlimited
    Before executing this function, user should:
        - Call getReserves() to get the ratio of two tokens in the pool. This is done to calculate the ratio in which the liquidity provider should provide 
          tokens (as to not lose the provided value in arbitrages)
        - Give the Router the allowance needed for the tranaction to pass (via IERC20 approve) 
    */
    function provideLiquidity(
        uint _amountNoi,
        uint _amountDai /*, uint _percentError*/
    )
        external
        returns (
            uint amountA,
            uint amountB,
            uint liquidity
        )
    {
        return
            IRouter02(poolRouterAddr).addLiquidity(
                noiAddr,
                daiAddr,
                _amountNoi,
                _amountDai,
                0, //_amountNoi * ((100 - _percentError) * scale / 100) / scale,
                0, //_amountDai * ((100 - _percentError) * scale / 100) / scale,
                address(msg.sender),
                MAX_UINT
            );
    }

    function removeLiquidity(
        uint _liquidity /*, uint minNoi, uint minDai */
    ) external returns (uint amountNoi, uint amountDai) {
        return
            IRouter02(poolRouterAddr).removeLiquidity(
                noiAddr,
                daiAddr,
                _liquidity,
                0, //minNoi,
                0, //minDai,
                address(msg.sender),
                MAX_UINT
            );
    }

    function exchangeNoiForDai(uint _amount)
        external
        returns (uint inputAmount, uint outputAmount)
    {
        address[] memory tokenAddresses;
        tokenAddresses[0] = noiAddr;
        tokenAddresses[1] = daiAddr;

        uint[] memory returnAmounts = IRouter02(poolRouterAddr)
            .swapExactTokensForTokens(
                _amount,
                0,
                tokenAddresses,
                address(msg.sender),
                MAX_UINT
            );

        inputAmount = returnAmounts[0];
        outputAmount = returnAmounts[1];
    }

    function exchangeDaiForNoi(uint _amount)
        external
        returns (uint inputAmount, uint outputAmount)
    {
        address[] memory tokenAddresses;
        tokenAddresses[0] = daiAddr;
        tokenAddresses[1] = noiAddr;

        uint[] memory returnAmounts = IRouter02(poolRouterAddr)
            .swapExactTokensForTokens(
                _amount,
                0,
                tokenAddresses,
                address(msg.sender),
                MAX_UINT
            );

        inputAmount = returnAmounts[0];
        outputAmount = returnAmounts[1];
    }

    //for test purposes only; dont forget to authorize router for tokens!!!!!!!!!! nigguh
    function getDAI(uint _amount) public payable returns (uint amountReceived) {
        IRouter02 rout = IRouter02(poolRouterAddr);
        address[] memory addrs = new address[](2);
        (addrs[0], addrs[1]) = (rout.WETH(), daiAddr);

        rout.swapETHForExactTokens{value: msg.value}(
            _amount,
            addrs,
            msg.sender,
            MAX_UINT
        );
        amountReceived = 1;
    }

    receive() external payable {}

    fallback() external payable {}
}
