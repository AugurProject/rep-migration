const assert = require("chai").assert;
const freezeRep = require("../lib/freeze-rep");
const constants = require("../lib/constants");

describe("lib/freeze-rep", () => {
  describe("freezeRep", () => {
    const test = t => it(t.description, () => {
      freezeRep(t.params.rpc, t.assertions);
    });
    test({
      description: "Freeze legacy REP contract",
      params: {
        rpc: {
          getCoinbase: () => "0x1000000000000000000000000000000000000000",
          transact: (p) => {
            assert.strictEqual(p.name, "transfer");
            assert.deepEqual(p.params, [
              constants.LEGACY_REP_CREATION_OVERFLOW_ADDRESS,
              constants.LEGACY_REP_CREATION_OVERFLOW_VALUE
            ]);
            assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
            assert.strictEqual(p.to, constants.LEGACY_REP_CONTRACT_ADDRESS);
            assert.isFunction(p.onSent);
            assert.isFunction(p.onSuccess);
            assert.isFunction(p.onFailed);
            p.onSuccess({});
          }
        }
      },
      assertions: (err) => {
        assert.isNull(err);
      }
    });
  });
});
