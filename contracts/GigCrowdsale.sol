pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./GigBlack.sol";


contract GigCrowdsale is CappedCrowdsale, TimedCrowdsale {
    
    function GigCrowdsale(
        uint256 _startTime, 
        uint256 _endTime, 
        uint256 _rate, 
        uint256 _cap, 
        address _wallet, 
        GigBlack _token) public
    CappedCrowdsale(_cap)
    TimedCrowdsale(_startTime, _endTime)
    Crowdsale(_rate, _wallet, _token)
    {
    }
    
}
