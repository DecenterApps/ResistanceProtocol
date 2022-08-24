// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./NOI.sol";
import "hardhat/console.sol";

error ExchangePoolSimMock__CantSendEth();
error ExchangePoolSimMock__EthAmountExceedsLimit();
error ExchangePoolSimMock__NoiAmountExceedsLimit();

contract ExchangePoolSimMock {
    NOI private immutable noiContract;
    AggregatorV3Interface private immutable ethPriceFeed;

    constructor(address _noiContract, address ethPriceFeedAddress) {
        noiContract = NOI(_noiContract);
        ethPriceFeed = AggregatorV3Interface(ethPriceFeedAddress);
    }

    function addFunds(uint256 amount) public payable {
        noiContract.transferFrom(msg.sender, address(this), amount);
    }

    function putEthGetNoi() public payable {
        uint256 ethBalance = address(this).balance;
        uint256 noiBalance = noiContract.balanceOf(address(this));

        uint256 amount = (msg.value * noiBalance) / ethBalance;

        if (amount >= noiBalance)
            revert ExchangePoolSimMock__NoiAmountExceedsLimit();

        noiContract.transferFrom(address(this), msg.sender, amount);
    }

    function putNoiGetEth(uint256 amount) public {
        uint256 ethBalance = address(this).balance;
        uint256 noiBalance = noiContract.balanceOf(address(this));

        uint256 ethAmount = (amount * ethBalance) / noiBalance;

        if (ethAmount >= ethBalance)
            revert ExchangePoolSimMock__EthAmountExceedsLimit();

        noiContract.transferFrom(msg.sender, address(this), amount);

        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        if (success == false) revert ExchangePoolSimMock__CantSendEth();
    }

    function howMuchNoiForEth(uint256 amountEth) public view returns (uint256) {
        uint256 ethBalance = address(this).balance;
        uint256 noiBalance = noiContract.balanceOf(address(this));
        return (amountEth * noiBalance) / ethBalance;
    }

    function howMuchEthForNoi(uint256 amountNoi) public view returns (uint256) {
        uint256 ethBalance = address(this).balance;
        uint256 noiBalance = noiContract.balanceOf(address(this));
        return (amountNoi * ethBalance) / noiBalance;
    }

    function getNoiMarketPrice() public view returns (uint256) {
        uint256 ethAmount = howMuchEthForNoi(1e18);
        return (ethAmount * getEthPrice()) / 1e18;
    }

    function getEthPrice() public view returns (uint256) {
        (, int256 price, , , ) = ethPriceFeed.latestRoundData();
        return uint256(price);
    }

    function getReserves()
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        uint256 noiCnt = noiContract.balanceOf(address(this));
        uint256 ethCnt = address(this).balance;
        if (noiCnt == 0 || ethCnt == 0) {
            return (100000e18, 200e18, block.timestamp);
        } else {
            return (noiCnt, ethCnt, block.timestamp);
        }
    }
}
