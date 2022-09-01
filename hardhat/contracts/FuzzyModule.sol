// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IRedemptionRateController.sol";
import "hardhat/console.sol";

error FuzzyModule__NotOwner();
error FuzzyModule__NotRateSetter();

contract FuzzyModule {
    address public CPIControllerContractAddress;
    address public absPiControllerContractAddress;
    address public rateSetterContractAddress;
    address public immutable owner;

    uint256 constant EIGHTEEN_DIGIT_NUMBER = 10**18;
    uint256 constant TWENTY_SEVEN_DIGIT_NUMBER = 10**27;
    uint256 constant ONE = TWENTY_SEVEN_DIGIT_NUMBER;

    modifier onlyRateSetter() {
        if(msg.sender != rateSetterContractAddress) revert FuzzyModule__NotRateSetter();
        _;
    }

    modifier onlyOwner() {
        if(msg.sender != owner) revert FuzzyModule__NotOwner();
        _;
    }

    constructor(address _owner, address _absPiAddress, address _CPIaddress) {
        owner = _owner;
        CPIControllerContractAddress = _CPIaddress;
        absPiControllerContractAddress = _absPiAddress;
    }

    function modifyAddressParameter(bytes32 _parameter, address _value) external onlyOwner {
        if(_parameter == "CPIControllerContractAddress")
            CPIControllerContractAddress = _value;
        else if(_parameter == "absPiControllerContractAddress")
            absPiControllerContractAddress = _value;
        else if(_parameter == "rateSetterContractAddress")
            rateSetterContractAddress = _value;
    }

    function computeRate(
        uint256 _marketPrice,
        uint256 _redemptionPrice,
        uint256 _marketValue,
        uint256 _alphaAbs,
        uint256 _alphaCPI
    ) external onlyRateSetter returns (uint256) {
        uint256 rrStable = IRedemptionRateController(absPiControllerContractAddress)
            .computeRate(_marketPrice, _redemptionPrice, _alphaAbs);
        console.log(rrStable);
        uint256 rrCPI = IRedemptionRateController(CPIControllerContractAddress)
            .computeRate(_marketValue, _redemptionPrice, _alphaCPI);
        console.log(rrCPI);

        uint256 percErrorStable = 
            absolute(int256(_marketPrice * EIGHTEEN_DIGIT_NUMBER) - int256(_redemptionPrice)) * ONE / _redemptionPrice;
        uint256 percErrorCPI = 
            absolute(int256(_redemptionPrice) - int256(_marketValue * EIGHTEEN_DIGIT_NUMBER)) * ONE / _redemptionPrice;
        
        uint256 weightStable = percent(ONE, 50);
        if (percErrorStable > percent(ONE, 10))
            weightStable = ONE;
        else if (percErrorStable > 0){
            weightStable = percent(ONE, 95) + (percent(ONE, 5) * (percErrorStable * 10)) / TWENTY_SEVEN_DIGIT_NUMBER;
            weightStable = weightStable + (ONE - weightStable) * percErrorStable / (percErrorStable + percErrorCPI);
        }
        uint256 weightCPI = ONE - weightStable;
        console.log((weightStable * rrStable + weightCPI * rrCPI) / TWENTY_SEVEN_DIGIT_NUMBER);
        return (weightStable * rrStable + weightCPI * rrCPI) / TWENTY_SEVEN_DIGIT_NUMBER;
    }

    function absolute(int256 _x) internal pure returns (uint256){
        return (_x < 0) ? uint256(-_x) : uint256(_x);
    }

    function percent(uint256 _value, uint256 _percentage) internal pure returns (uint256){
        return _value * _percentage / 100;
    }
}
