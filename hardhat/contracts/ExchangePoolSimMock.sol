// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./NOI.sol";

error ExchangePoolSimMock__CantSendEth();

contract ExchangePoolSimMock {
    NOI private immutable noiContract;
    AggregatorV3Interface private immutable ethPriceFeed;

    constructor(address _noiContract) {
        noiContract = NOI(_noiContract);
        ethPriceFeed = AggregatorV3Interface(
            0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
        );
    }

    function addFunds(uint256 amount) public payable {
        noiContract.transferFrom(msg.sender, address(this), amount);
    }

    function putEthGetNoi() public payable {
        uint256 ethBalance = address(this).balance;
        uint256 noiBalance = noiContract.balanceOf(address(this));

        uint256 amount = (msg.value * noiBalance) / ethBalance;

        noiContract.transferFrom(address(this), msg.sender, amount);
    }

    function putNoiGetEth(uint256 amount) public {
        uint256 ethBalance = address(this).balance;
        uint256 noiBalance = noiContract.balanceOf(address(this));

        uint256 ethAmount = (amount * ethBalance) / noiBalance;

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
        uint256 noiAmount = howMuchNoiForEth(1e18);
        uint256 ethPrice = getEthPrice();
        return noiAmount / (ethPrice * 1e10);
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
        uint256 daiCnt = address(this).balance * getEthPrice();
        if (noiCnt == 0 || daiCnt == 0) {
            return (1, 1, block.timestamp);
        } else {
            return (noiCnt, daiCnt, block.timestamp);
        }
    }
}
