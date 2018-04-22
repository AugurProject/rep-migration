const assert = require("chai").assert;
const lib = require("../lib/verify-rep-migration");
const constants = require("../lib/constants");

describe("lib/verify-rep-migration", () => {
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
            if (p.to === constants.REP_CONTRACT_ADDRESS) {
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
  describe("verifyRepMigration", () => {
    const test = t => it(t.description, () => {
      lib.verifyRepMigration(t.params.rpc, t.params.allRepAddresses, t.assertions);
    });
    test({
      description: "3 consistent addresses (successful migration)",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            if (p.name === "totalSupply") {
              callback(constants.LEGACY_REP_TOTAL_SUPPLY);
            } else {
              callback("0x0000000000000000000000000000000000000000000000000000000000000001");
            }
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
    test({
      description: "Inconsistent total supply (failed migration)",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            if (p.name === "totalSupply") {
              callback("0x00000000000000000000000000000000000000000009195731e2ce35eb000001");
            } else {
              callback("0x0000000000000000000000000000000000000000000000000000000000000001");
            }
          }
        },
        allRepAddresses: [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x0000000000000000000000000000000000001337"
        ]
      },
      assertions: (err) => {
        assert.strictEqual(err, "Inconsistent total supply: 0x00000000000000000000000000000000000000000009195731e2ce35eb000000 0x00000000000000000000000000000000000000000009195731e2ce35eb000001");
      }
    });
    test({
      description: "2 consistent, 1 inconsistent address (failed migration)",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            if (p.name === "totalSupply") {
              callback(constants.LEGACY_REP_TOTAL_SUPPLY);
            } else {
              if (p.params[0] === "0x000000000000000000000000000000000000d00d") {
                if (p.to === constants.REP_CONTRACT_ADDRESS) {
                  callback("0x0000000000000000000000000000000000000000000000000000000000000001");
                } else {
                  callback("0x0000000000000000000000000000000000000000000000000000000000000002");
                }
              } else {
                callback("0x0000000000000000000000000000000000000000000000000000000000000001");
              }
            }
          }
        },
        allRepAddresses: [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x0000000000000000000000000000000000001337"
        ]
      },
      assertions: (err) => {
        assert.strictEqual(err, "Inconsistent balances for address 0x000000000000000000000000000000000000d00d: 0x0000000000000000000000000000000000000000000000000000000000000002 0x0000000000000000000000000000000000000000000000000000000000000001");
      }
    });
  });
});
