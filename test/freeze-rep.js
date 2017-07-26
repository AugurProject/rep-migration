const assert = require("chai").assert;
const path = require("path");
const freezeRep = require("../lib/freeze-rep");
const constants = require("../lib/constants");

describe("lib/freeze-rep", () => {
  describe("freezeRep", () => {
    const test = t => it(t.description, () => {
      freezeRep(t.params.rpc, t.params.senderAddress, t.params.freezeRepFile, t.assertions);
    });
    test({
      description: "Freeze legacy REP contract",
      params: {
        rpc: {
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
  });
});
