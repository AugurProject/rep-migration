pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';


contract Initializable is Ownable {
  bool public initialized;

  modifier afterInitialized {
    require(initialized);
    _;
  }

  modifier beforeInitialized {
    require(!initialized);
    _;
  }

  function endInitialization() public onlyOwner beforeInitialized returns (bool) {
    initialized = true;
    return true;
  }
}


/**
 * @title REP2 Token
 * @dev REP2 Mintable Token with migration from legacy contract
 */
contract RepToken is Ownable, Initializable, PausableToken {
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
  function RepToken(address _legacyRepContract, uint256 _amountUsedToFreeze, address _accountToSendFrozenRepTo) {
    require(_legacyRepContract != 0);
    legacyRepContract = ERC20Basic(_legacyRepContract);
    targetSupply = legacyRepContract.totalSupply();
    balances[_accountToSendFrozenRepTo] = _amountUsedToFreeze;
    totalSupply = _amountUsedToFreeze;
    pause();
  }

  /**
    * @dev Copies the balance of a batch of addresses from the legacy contract
    * @param _holders Array of addresses to migrate balance
    * @return True if operation was completed
    */
  function migrateBalances(address[] _holders) onlyOwner beforeInitialized returns (bool) {
    for (uint256 i = 0; i < _holders.length; i++) {
      migrateBalance(_holders[i]);
    }
    return true;
  }

  /**
    * @dev Copies the balance of a single addresses from the legacy contract
    * @param _holder Address to migrate balance
    * @return True if balance was copied, false if was already copied or address had no balance
    */
  function migrateBalance(address _holder) onlyOwner beforeInitialized returns (bool) {
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

    if (targetSupply == totalSupply) {
      endInitialization();
    }
    return true;
  }

  /**
   * @dev Unpauses the contract with the caveat added that it can only happen after initialization.
   */
  function unpause() onlyOwner whenPaused afterInitialized returns (bool) {
    super.unpause();
    return true;
  }
}
