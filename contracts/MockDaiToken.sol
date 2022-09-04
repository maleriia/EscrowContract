pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDaiToken is ERC20 {
    constructor() ERC20("MockDaiToken", "DAI") {
        _mint(msg.sender, 100000000 * 10**decimals());
    }

    mapping(address => bool) received;

//user can get only 1 time 10 tokens Dai
    function getTokens() public {
        require(
            received[msg.sender] != true,
            "U have already received your allowed tokens"
        );
        _mint(msg.sender, 10 * 10**decimals());
        received[msg.sender] = true;
    }
}
