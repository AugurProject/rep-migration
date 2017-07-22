const assert = require("chai").assert;
const lib = require("../scripts/lib/migrate-rep");

describe("scripts/lib/migrate-rep", () => {
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
            assert.strictEqual(p.to, lib.REP_CONTRACT_ADDRESS);
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
  describe("verifySingleAddressRepMigration", () => {
    const test = t => it(t.description, () => {
      lib.verifySingleAddressRepMigration(t.params.rpc, t.params.repAddress, t.assertions);
    });
    test({
      description: "Consistent balances (successful migration)",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            callback("0x0000000000000000000000000000000000000000000000000000000000000001");
          }
        },
        repAddress: "0x0000000000000000000000000000000000000b0b"
      },
      assertions: (err) => {
        assert.isNull(err);
      }
    });
    test({
      description: "Inconsistent balances (failed migration)",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            if (p.to === lib.REP_CONTRACT_ADDRESS) {
              callback("0x0000000000000000000000000000000000000000000000000000000000000001");
            } else {
              callback("0x0000000000000000000000000000000000000000000000000000000000000002");
            }
          }
        },
        repAddress: "0x0000000000000000000000000000000000000b0b"
      },
      assertions: (err) => {
        assert.strictEqual(err, "Inconsistent balances for address 0x0000000000000000000000000000000000000b0b: 0x0000000000000000000000000000000000000000000000000000000000000002 0x0000000000000000000000000000000000000000000000000000000000000001");
      }
    });
  });
  // describe("verifyRepMigration", () => {
  //   const test = t => it(t.description, () => {
  //     lib.verifyRepMigration(t.params.allRepAddresses, t.assertions);
  //   });
  //   test({
  //     description: "Verify Rep migration",
  //     params: {
  //       allRepAddresses: [
  //         "0x0000000000000000000000000000000000000b0b",
  //         "0x000000000000000000000000000000000000d00d",
  //         "0x0000000000000000000000000000000000001337"
  //       ]
  //     },
  //     assertions: (output) => {
  //     }
  //   });
  // });
  // describe("migrateRep", () => {
  //   const test = t => it(t.description, () => {
  //     lib.migrateRep(t.params.rpc, t.params.allRepAddresses, t.assertions);
  //   });
  //   test({
  //     description: "Migrate Rep",
  //     params: {
  //       rpc: {
  //         getCoinbase: () => "0x1000000000000000000000000000000000000000",
  //         transact: (p) => {
  //           assert.strictEqual(p.name, "migrateBalances");
  //           assert.deepEqual(p.params, [
  //             "0x0000000000000000000000000000000000000b0b",
  //             "0x000000000000000000000000000000000000d00d",
  //             "0x0000000000000000000000000000000000001337"
  //           ]);
  //           assert.strictEqual(p.from, "0x1000000000000000000000000000000000000000");
  //           assert.strictEqual(p.to, lib.REP_CONTRACT_ADDRESS);
  //           assert.strictEqual(p.returns, "null");
  //           assert.isFunction(p.onSent);
  //           assert.isFunction(p.onSuccess);
  //           assert.isFunction(p.onFailed);
  //           p.onSuccess({});
  //         }
  //       },
  //       allRepAddresses: [
  //         "0x0000000000000000000000000000000000000b0b",
  //         "0x000000000000000000000000000000000000d00d",
  //         "0x0000000000000000000000000000000000001337"
  //       ]
  //     },
  //     assertions: (err) => {
  //       assert.isNull(err);
  //     }
  //   });
  // });
});
