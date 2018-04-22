const assert = require("chai").assert;
const unpause = require("../lib/unpause");
const constants = require("../lib/constants");

describe("lib/unpause", () => {
  describe("unpause", () => {
    let testTransferCallCount;
    const test = t => it(t.description, () => {
      testTransferCallCount = 0;
      try {
        unpause(t.params.rpc, t.params.senderAddress, t.assertions);
      } catch (exc) {
        t.assertions(exc);
      }
    });
    test({
      description: "Unpause new REP contract",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            assert.deepEqual(p, {
              name: "transfer",
              params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
              signature: ["address", "uint256"],
              from: "0x1000000000000000000000000000000000000000",
              to: constants.REP_CONTRACT_ADDRESS
            });
            if (++testTransferCallCount === 1) {
              callback({ error: "0x" });
            } else {
              callback("0x0000000000000000000000000000000000000000000000000000000000000001");
            }
          },
          transact: (p, _, onSent, onSuccess, onFailed) => {
            assert.strictEqual(p.name, "unpause");
            assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
            assert.strictEqual(p.to, constants.REP_CONTRACT_ADDRESS);
            assert.isFunction(onSent);
            assert.isFunction(onSuccess);
            assert.isFunction(onFailed);
            onSuccess({ blockNumber: "0x64" });
          }
        },
        senderAddress: "0x1000000000000000000000000000000000000000"
      },
      assertions: (err) => {
        assert.isNull(err);
      }
    });
    test({
      description: "Pre-unpause test transfer succeeds (should fail)",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            assert.deepEqual(p, {
              name: "transfer",
              params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
              signature: ["address", "uint256"],
              from: "0x1000000000000000000000000000000000000000",
              to: constants.REP_CONTRACT_ADDRESS
            });
            callback("0x0000000000000000000000000000000000000000000000000000000000000001");
          },
          transact: (p, _, onSent, onSuccess, onFailed) => {
            assert.strictEqual(p.name, "unpause");
            assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
            assert.strictEqual(p.to, constants.REP_CONTRACT_ADDRESS);
            assert.isFunction(onSent);
            assert.isFunction(onSuccess);
            assert.isFunction(onFailed);
            onSuccess({});
          }
        },
        senderAddress: "0x1000000000000000000000000000000000000000"
      },
      assertions: (err) => {
        assert.strictEqual(err, "Pre-unpause REP transfer succeeded (expected failure)");
      }
    });
    test({
      description: "Post-unpause test transfer fails (should succeed)",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            assert.deepEqual(p, {
              name: "transfer",
              params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
              signature: ["address", "uint256"],
              from: "0x1000000000000000000000000000000000000000",
              to: constants.REP_CONTRACT_ADDRESS
            });
            callback({ error: "0x" });
          },
          transact: (p, _, onSent, onSuccess, onFailed) => {
            assert.strictEqual(p.name, "unpause");
            assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
            assert.strictEqual(p.to, constants.REP_CONTRACT_ADDRESS);
            assert.isFunction(onSent);
            assert.isFunction(onSuccess);
            assert.isFunction(onFailed);
            onSuccess({});
          }
        },
        senderAddress: "0x1000000000000000000000000000000000000000"
      },
      assertions: (err) => {
        assert.strictEqual(err, "Post-unpause REP transfer failed (expected success)");
      }
    });
  });
});
