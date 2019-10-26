pragma solidity 0.5.10;

import "./Claimable.sol";
import "../openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../openzeppelin-contracts/contracts/token/ERC20/ERC20Burnable.sol";


contract StableCoin is ERC20, ERC20Burnable, Claimable {
    string public name = "StableCoin";
    string public symbol = "STC";
    uint8 public decimals = 8;

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param value The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 value) public onlyOwner returns (bool) {
        require(value > 0);
        _mint(to, value);
        return true;
    }
}
