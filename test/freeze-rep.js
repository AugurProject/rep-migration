const assert = require("chai").assert;
const path = require("path");
const freezeRep = require("../lib/freeze-rep");
const constants = require("../lib/constants");

describe("lib/freeze-rep", () => {
  describe("freezeRep", () => {
    let testTransferCallCount
    const test = t => it(t.description, () => {
      testTransferCallCount = 0;
      try {
        freezeRep(t.params.rpc, t.params.senderAddress, t.params.freezeRepFile, t.assertions);
      } catch (exc) {
        t.assertions(exc);
      }
    });
    test({
      description: "Freeze legacy REP contract",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            assert.deepEqual(p, {
              name: "transfer",
              params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
              signature: ["address", "uint256"],
              from: "0x1000000000000000000000000000000000000000",
              to: constants.LEGACY_REP_CONTRACT_ADDRESS
            });
            if (++testTransferCallCount === 1) {
              callback("0x0000000000000000000000000000000000000000000000000000000000000001");
            } else {
              callback({ error: "0x" });
            }
          },
          transact: (p, _, onSent, onSuccess, onFailed) => {
            assert.strictEqual(p.name, "transfer");
            assert.strictEqual(p.data, constants.LEGACY_REP_CREATION_OVERFLOW_DATA);
            assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
            assert.strictEqual(p.to, constants.LEGACY_REP_CONTRACT_ADDRESS);
            assert.isFunction(onSent);
            assert.isFunction(onSuccess);
            assert.isFunction(onFailed);
            onSuccess({ blockNumber: "0x64" });
          }
        },
        senderAddress: "0x1000000000000000000000000000000000000000",
        freezeRepFile: path.join(__dirname, "..", "test", "test-freeze-rep.json")
      },
      assertions: (err) => {
        assert.isNull(err);
        assert.deepEqual(require(path.join(__dirname, "..", "test", "test-freeze-rep.json")), {
          senderAddress: "0x1000000000000000000000000000000000000000",
          data: constants.LEGACY_REP_CREATION_OVERFLOW_DATA,
          blockNumber: 100
        });
      }
    });
    test({
      description: "Pre-freeze test transfer fails (should succeed)",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            assert.deepEqual(p, {
              name: "transfer",
              params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
              signature: ["address", "uint256"],
              from: "0x1000000000000000000000000000000000000000",
              to: constants.LEGACY_REP_CONTRACT_ADDRESS
            });
            callback({ error: "0x" });
          },
          transact: (p, _, onSent, onSuccess, onFailed) => {
            assert.strictEqual(p.name, "transfer");
            assert.strictEqual(p.data, constants.LEGACY_REP_CREATION_OVERFLOW_DATA);
            assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
            assert.strictEqual(p.to, constants.LEGACY_REP_CONTRACT_ADDRESS);
            assert.isFunction(onSent);
            assert.isFunction(onSuccess);
            assert.isFunction(onFailed);
            onSuccess({ blockNumber: 100 });
          }
        },
        senderAddress: "0x1000000000000000000000000000000000000000",
        freezeRepFile: path.join(__dirname, "..", "test", "test-freeze-rep.json")
      },
      assertions: (err) => {
        assert.strictEqual(err, "Pre-freeze REP transfer failed (expected success)");
      }
    });
    test({
      description: "Post-freeze test transfer succeeds (should fail)",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            assert.deepEqual(p, {
              name: "transfer",
              params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
              signature: ["address", "uint256"],
              from: "0x1000000000000000000000000000000000000000",
              to: constants.LEGACY_REP_CONTRACT_ADDRESS
            });
            callback("0x0000000000000000000000000000000000000000000000000000000000000001");
          },
          transact: (p, _, onSent, onSuccess, onFailed) => {
            assert.strictEqual(p.name, "transfer");
            assert.strictEqual(p.data, constants.LEGACY_REP_CREATION_OVERFLOW_DATA);
            assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
            assert.strictEqual(p.to, constants.LEGACY_REP_CONTRACT_ADDRESS);
            assert.isFunction(onSent);
            assert.isFunction(onSuccess);
            assert.isFunction(onFailed);
            onSuccess({ blockNumber: 100 });
          }
        },
        senderAddress: "0x1000000000000000000000000000000000000000",
        freezeRepFile: path.join(__dirname, "..", "test", "test-freeze-rep.json")
      },
      assertions: (err) => {
        assert.strictEqual(err, "Post-freeze REP transfer succeeded (expected failure)");
      }
    });
  });
});
