pragma solidity 0.5.12;

import "../openzeppelin-contracts/contracts/math/SafeMath.sol";
import "../openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../openzeppelin-contracts/contracts/ownership/Ownable.sol";

contract DeliveryEscrow is Ownable {
    using SafeMath for uint256;
    IERC20 public token;
    mapping(address => uint256) public totalFunds;
    mapping(address => uint256) public lockedFunds;

    constructor(IERC20 _token) public {
        token = _token;
    }

    event FundsAdded(
        address indexed carrier,
        uint256 indexed amount
    );

    event FundsLocked(
        address indexed carrier,
        uint256 indexed amount
    );

    event FundsUnlocked(
        address indexed carrier,
        uint256 indexed amount
    );

    function addFunds(address carrier, uint256 amount) public onlyOwner {
        require(carrier != address(0), "Wrong address");
        require(amount > 0, "Amount is zero");
        require(token.allowance(carrier, address(this))
                >= amount, "Amount exceed carrier allowance");
        token.transferFrom(carrier, address(this), amount);
        totalFunds[carrier] = totalFunds[carrier].add(amount);
        emit FundsAdded(carrier, amount);
    }

    function lockFunds(address carrier, uint256 amount) public onlyOwner {
        require(amount > 0, "Amount is zero");
        require(totalFunds[carrier] - lockedFunds[carrier]
                >= amount, "Amount exceed carrier balance");
        lockedFunds[carrier] = lockedFunds[carrier].add(amount);
        emit FundsLocked(carrier, amount);
    }

    function unlockFunds(address carrier, uint256 amount) public onlyOwner {
        require(amount > 0, "Amount is zero");
        require(lockedFunds[carrier] >= amount,
                "Amount exceed carrier locked funds");
        lockedFunds[carrier] = lockedFunds[carrier].sub(amount);
        emit FundsUnlocked(carrier, amount);
    }
}
