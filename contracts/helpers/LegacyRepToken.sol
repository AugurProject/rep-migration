pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';

contract LegacyRepToken is StandardToken, PausableToken {
  function LegacyRepToken(address) {
    pause();
  }

  function assign(address holder, uint256 amount) {
    balances[holder] += amount;
    totalSupply += amount;
  }

  function freeze(address freezer, uint256 amountUsedToFreeze) {
    balances[freezer] -= amountUsedToFreeze;
  }
}
