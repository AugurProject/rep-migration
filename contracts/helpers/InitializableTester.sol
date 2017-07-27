pragma solidity ^0.4.11;

import '../RepToken.sol';


contract InitializableTester is Initializable {
    function try_end_initialize() returns (uint256) {
        endInitialization();
        return 3;
    }

    function only_callable_before_initialization() beforeInitialized returns (uint256) {
        return 5;
    }

    function only_callable_after_initialization() afterInitialized returns (uint256) {
        return 7;
    }
}
