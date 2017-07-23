const assert = require("chai").assert;
const lib = require("../lib/migrate-rep");
const constants = require("../lib/constants");

describe("lib/migrate-rep", () => {
  describe("chunkRepAddresses", () => {
    const test = t => it(t.description, () => {
      t.assertions(lib.chunkRepAddresses(t.params.allRepAddresses, t.params.addressesPerChunk));
    });
    test({
      description: "Length not evenly divisble by chunk size",
      params: {
        allRepAddresses: [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x0000000000000000000000000000000000001337",
          "0x1000000000000000000000000000000000000b0b",
          "0x100000000000000000000000000000000000d00d"
        ],
        addressesPerChunk: 2
      },
      assertions: (chunkedRepAddresses) => {
        assert.deepEqual(chunkedRepAddresses, [[
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d"
        ], [
          "0x0000000000000000000000000000000000001337",
          "0x1000000000000000000000000000000000000b0b"
        ], [
          "0x100000000000000000000000000000000000d00d"
        ]]);
      }
    });
    test({
      description: "Length equal to chunk size",
      params: {
        allRepAddresses: [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d"
        ],
        addressesPerChunk: 2
      },
      assertions: (chunkedRepAddresses) => {
        assert.deepEqual(chunkedRepAddresses, [[
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d"
        ]]);
      }
    });
    test({
      description: "Length evenly divisble by chunk size",
      params: {
        allRepAddresses: [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x1000000000000000000000000000000000000b0b",
          "0x100000000000000000000000000000000000d00d"
        ],
        addressesPerChunk: 2
      },
      assertions: (chunkedRepAddresses) => {
        assert.deepEqual(chunkedRepAddresses, [[
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d"
        ], [
          "0x1000000000000000000000000000000000000b0b",
          "0x100000000000000000000000000000000000d00d"
        ]]);
      }
    });
    test({
      description: "Length below chunk size",
      params: {
        allRepAddresses: [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x0000000000000000000000000000000000001337"
        ],
        addressesPerChunk: 100
      },
      assertions: (chunkedRepAddresses) => {
        assert.deepEqual(chunkedRepAddresses, [[
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x0000000000000000000000000000000000001337"
        ]]);
      }
    });
    test({
      description: "Empty list",
      params: {
        allRepAddresses: [],
        addressesPerChunk: 100
      },
      assertions: (chunkedRepAddresses) => {
        assert.deepEqual(chunkedRepAddresses, []);
      }
    });
  });
  describe("migrateRepChunk", () => {
    const test = t => it(t.description, () => {
      lib.migrateRepChunk(t.params.rpc, t.params.repAddressChunk, t.assertions);
    });
    test({
      description: "Migrate a chunk of Rep addresses",
      params: {
        rpc: {
          getCoinbase: () => "0x1000000000000000000000000000000000000000",
          transact: (p) => {
            assert.strictEqual(p.name, "migrateBalances");
            assert.deepEqual(p.params, [
              "0x0000000000000000000000000000000000000b0b",
              "0x000000000000000000000000000000000000d00d",
              "0x0000000000000000000000000000000000001337"
            ]);
            assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
            assert.strictEqual(p.to, constants.REP_CONTRACT_ADDRESS);
            assert.strictEqual(p.returns, "null");
            assert.isFunction(p.onSent);
            assert.isFunction(p.onSuccess);
            assert.isFunction(p.onFailed);
            p.onSuccess({});
          }
        },
        repAddressChunk: [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x0000000000000000000000000000000000001337"
        ]
      },
      assertions: (err) => {
        assert.isNull(err);
      }
    });
  });
  describe("migrateRep", () => {
    const test = t => it(t.description, () => {
      lib.migrateRep(t.params.rpc, t.params.allRepAddresses, t.assertions);
    });
    test({
      description: "Migrate Rep",
      params: {
        rpc: {
          getCoinbase: () => "0x1000000000000000000000000000000000000000",
          transact: (p) => {
            assert.strictEqual(p.name, "migrateBalances");
            assert.deepEqual(p.params, [
              "0x0000000000000000000000000000000000000b0b",
              "0x000000000000000000000000000000000000d00d",
              "0x0000000000000000000000000000000000001337"
            ]);
            assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
            assert.strictEqual(p.to, constants.REP_CONTRACT_ADDRESS);
            assert.strictEqual(p.returns, "null");
            assert.isFunction(p.onSent);
            assert.isFunction(p.onSuccess);
            assert.isFunction(p.onFailed);
            p.onSuccess({});
          }
        },
        allRepAddresses: [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x0000000000000000000000000000000000001337"
        ]
      },
      assertions: (err) => {
        assert.isNull(err);
      }
    });
  });
  contract("RepToken", function ([_, owner, zeroHolder, nonZeroHolder1, nonZeroHolder2]) {
    const nonZeroAmount1 = new BigNumber(4000, 10);
    const nonZeroAmount2 = new BigNumber(8000, 10);
    const totalAmount = nonZeroAmount1.plus(nonZeroAmount2);
    let legacyRep;
    before(async function () {
      legacyRep = await LegacyRepToken.new({ from: owner });
      await legacyRep.assign(zeroHolder, totalAmount);
      await legacyRep.unpause({ from: owner });
      await legacyRep.transfer(nonZeroHolder1, nonZeroAmount1, { from: zeroHolder });
      await legacyRep.transfer(nonZeroHolder2, nonZeroAmount2, { from: zeroHolder });
    });
    it("Should migrate REP held by nonZeroHolder1 and nonZeroHolder2", (done) => {
      rpc.connect({
        httpAddresses: ["http://127.0.0.1:8545"],
        wsAddresses: [],
        ipcAddresses: [],
        errorHandler: () => {}
      }, () => {
        assert.notEqual(rpc.getNetworkID(), "1");
        rpc.eth.blockNumber((blockNumber) => {
          lib.migrateRep(rpc, [nonZeroHolder1, nonZeroHolder2], (err) => {
            assert.isNull(err);
            rpc.resetState();
            done();
          });
        });
      });
    });
  });
});
