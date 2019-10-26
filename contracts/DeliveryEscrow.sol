pragma solidity 0.5.10;

import "../openzeppelin-contracts/contracts/math/SafeMath.sol";
import "../openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./Claimable.sol";

/**
* @title DeliveryEscrow
*
* @dev Implements the Contract for Delivery Service Escrow
*/
contract DeliveryEscrow is Claimable {
    using SafeMath for uint256;
    IERC20 public token;
    // the records about individual balances
    mapping(address => uint256) public balances;
    // the records about already frozen amounts
    mapping(address => uint256) public frozenBalances;
    // the sum of registered balance
    uint256 public totalBalance;

    constructor(
        IERC20 _token
    ) public {
        // solhint-disable-next-line not-rely-on-time
        token = _token;
    }

    /**
     * @dev Top up the user's balance on the platform
     *
     * Called by the backend after token got transferred on the Keeper
     */
    function topUp(address _to, uint256 _value) public onlyOwner {
        require(_to != address(0));
        require(_value > 0);
        require(totalBalance.add(_value)
                <= token.balanceOf(address(this)), "not enough tokens");
        balances[_to] = balances[_to].add(_value);
        totalBalance = totalBalance.add(_value);
    }

    /**
     * @dev Freeze user's balance
     */
    function freeze(address _user, uint256 _value) public onlyOwner {
        require(_value > 0);
        require(totalBalance.add(_value)
                <= token.balanceOf(address(this)), "not enough tokens");
        balances[_user] = balances[_user].add(_value);
    }

    /**
     * @dev UnFreeze user's balance
     */
    function unFreeze(address _user, uint256 _value) public onlyOwner {
        require(_value > 0);
        balances[_user] = balances[_user].sub(_value);
    }

    /**
     * @dev Withdraws the allowed amount of tokens
     *
     * Called by the user through the Dapp or Etherscan write interface
     */
    function withdraw(address _to, uint256 _value) public {
        require(_to != address(0));
        require(_value > 0);
        totalBalance = totalBalance.sub(_value);
        token.transfer(_to, _value);
    }
}
