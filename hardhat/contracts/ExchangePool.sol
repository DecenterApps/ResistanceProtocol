// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "./interfaces/IERC20.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/IPool.sol";
import "./interfaces/IRouter.sol";
import "hardhat/console.sol";

contract ExchangePool {
    address poolRouterAddr;
    address poolAddr;
    address poolFactoryAddr;

    address noiAddr;
    address daiAddr;

    uint256 constant scale = 10**18;
    uint256 constant MAX_UINT = 2**256 - 1;

    //for tests only
    event LiquidityProvided(address provider, uint256 amountLPTokens);

    constructor(address _noiAddr) {
        poolRouterAddr = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; //both mainnet & kovan address
        poolFactoryAddr = IRouter02(poolRouterAddr).factory();
        daiAddr = 0x6B175474E89094C44Da98b954EedeAC495271d0F; //mainnet address (kovan address is different)
        noiAddr = _noiAddr;

        poolAddr = IFactory(poolFactoryAddr).createPair(noiAddr, daiAddr);
    }

    function getRouterAddress() public view returns (address routerAddress) {
        return poolRouterAddr;
    }

    function getReserves()
        public
        view
        returns (
            uint112 _reserve0,
            uint112 _reserve1,
            uint32 _blockTimestampLast
        )
    {
        (_reserve0, _reserve1, _blockTimestampLast) = IPool(poolAddr)
            .getReserves();
    }

    /*
    Before executing this function, user should:
        - Call getReserves() to get the ratio of two tokens in the pool. This is done to calculate the ratio in which the liquidity provider should provide 
          tokens (as to not lose the provided value in arbitrages)
        - Give this contract the allowance needed for the tranaction to pass (via IERC20 approve) 
    This function is a wrapped and simplified version of the Uniswap Router "addLiquidity" function. If necessary, a third parameter, uint percentError, may be 
    added, to calculate the minimum amount of assets to be provided before transaction reverts:  _amountNoi * ((100 - _percentError) * scale / 100) / scale
    */
    function provideLiquidity(uint256 _amountNoi, uint256 _amountDai)
        external
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        )
    {
        IERC20(noiAddr).transferFrom(msg.sender, address(this), _amountNoi);
        IERC20(daiAddr).transferFrom(msg.sender, address(this), _amountDai);

        IERC20(noiAddr).approve(poolRouterAddr, _amountNoi);
        IERC20(daiAddr).approve(poolRouterAddr, _amountDai);

        (amountA, amountB, liquidity) = IRouter02(poolRouterAddr).addLiquidity(
            noiAddr,
            daiAddr,
            _amountNoi,
            _amountDai,
            0, //_amountNoi * ((100 - _percentError) * scale / 100) / scale,
            0, //_amountDai * ((100 - _percentError) * scale / 100) / scale,
            address(msg.sender),
            MAX_UINT
        );

        emit LiquidityProvided(msg.sender, liquidity);
    }

    /*
    As with the "provideLiquidity" function, additional parameters may be added to set the minimum amount of assets to be returned before the
    transaction reverts (uint minNoi, uint minDai)
    */
    function removeLiquidity(uint256 _liquidity)
        external
        returns (uint256 amountNoi, uint256 amountDai)
    {
        IPool(poolAddr).transferFrom(msg.sender, address(this), _liquidity);
        IPool(poolAddr).approve(poolRouterAddr, _liquidity);

        (amountNoi, amountDai) = IRouter02(poolRouterAddr).removeLiquidity(
            noiAddr,
            daiAddr,
            _liquidity,
            0, //minNoi,
            0, //minDai,
            address(msg.sender),
            MAX_UINT
        );
    }

    function exchangeNoiForDai(uint256 _amount)
        external
        returns (uint256 inputAmount, uint256 outputAmount)
    {
        address[] memory tokenAddresses = new address[](2);
        tokenAddresses[0] = noiAddr;
        tokenAddresses[1] = daiAddr;

        IERC20(noiAddr).transferFrom(msg.sender, address(this), _amount);
        IERC20(noiAddr).approve(poolRouterAddr, _amount);

        uint256[] memory returnAmounts = IRouter02(poolRouterAddr)
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

    function exchangeDaiForNoi(uint256 _amount)
        external
        returns (uint256 inputAmount, uint256 outputAmount)
    {
        address[] memory tokenAddresses = new address[](2);
        tokenAddresses[0] = daiAddr;
        tokenAddresses[1] = noiAddr;

        IERC20(daiAddr).transferFrom(msg.sender, address(this), _amount);
        IERC20(daiAddr).approve(poolRouterAddr, _amount);

        uint256[] memory returnAmounts = IRouter02(poolRouterAddr)
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

    receive() external payable {}

    fallback() external payable {}
}
