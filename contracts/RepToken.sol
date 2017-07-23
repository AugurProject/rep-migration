pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';


/**
 * @title REP2 Token
 * @dev REP2 Mintable Token with migration from legacy contract
 */
contract RepToken is StandardToken, Ownable, PausableToken {
  ERC20Basic public legacyRepContract;
  uint256 public targetSupply;

  string public constant name = "Reputation";
  string public constant symbol = "REP";
  uint256 public constant decimals = 18;

  event Migrated(address indexed holder, uint256 amount);

  /**
    * @dev Creates a new RepToken instance
    * @param _legacyRepContract Address of the legacy ERC20Basic REP contract to migrate balances from
    */
  function RepToken(address _legacyRepContract) {
    require(_legacyRepContract != 0);
    legacyRepContract = ERC20Basic(_legacyRepContract);
    targetSupply = legacyRepContract.totalSupply();
    pause();
  }

  /**
    * @dev Copies the balance of a batch of addresses from the legacy contract
    * @param _holders Array of addresses to migrate balance
    * @return True if operation was completed
    */
  function migrateBalances(address[] _holders) onlyOwner whenPaused {
    for (uint256 i = 0; i < _holders.length; i++) {
      migrateBalance(_holders[i]);
    }
  }

  /**
    * @dev Copies the balance of a single addresses from the legacy contract
    * @param _holder Address to migrate balance
    * @return True if balance was copied, false if was already copied or address had no balance
    */
  function migrateBalance(address _holder) onlyOwner whenPaused returns (bool) {
    if (balances[_holder] > 0) {
      return false; // Already copied, move on
    }

    uint256 amount = legacyRepContract.balanceOf(_holder);
    if (amount == 0) {
      return false; // Has no balance in legacy contract, move on
    }

    balances[_holder] = amount;
    totalSupply = totalSupply.add(amount);
    Migrated(_holder, amount);
    return true;
  }

  /**
   * @dev Unpauses the contract only once total supply has been migrated, and removes ownership
   */
  function unpause() onlyOwner whenPaused returns (bool) {
    require(targetSupply == totalSupply);
    super.unpause();
    owner = address(0);
    return true;
  }
}
