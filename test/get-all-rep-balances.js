const assert = require("chai").assert;
const fs = require("fs");
const path = require("path");
const lib = require("../scripts/lib/all-rep-addresses");

const TEST_REP_ADDRESS_FILE = path.join(__dirname, "test-rep-address-file.txt");

describe("scripts/lib/all-rep-balances", () => {
  describe("writeAddressListToFile", () => {
    const test = t => it(t.description, () => {
      lib.writeAddressListToFile(t.params.repAddressFile, t.params.allRepAddresses, t.assertions);
    });
    test({
      description: "Save to file",
      params: {
        repAddressFile: TEST_REP_ADDRESS_FILE,
        allRepAddresses: [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x0000000000000000000000000000000000001337"
        ]
      },
      assertions: (err) => {
        assert.isNull(err);
        assert.deepEqual(fs.readFileSync(TEST_REP_ADDRESS_FILE, "utf8").split("\n"), [
          "0x0000000000000000000000000000000000000b0b",
          "0x000000000000000000000000000000000000d00d",
          "0x0000000000000000000000000000000000001337"
        ]);
      }
    });
  });
  describe("checkRepBalance", () => {
    const test = t => it(t.description, () => {
      lib.checkRepBalance(t.params.rpc, t.params.address, t.assertions);
    });
    test({
      description: "Address without REP",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            callback("0x0000000000000000000000000000000000000000000000000000000000000000");
          }
        },
        address: "MY_ADDRESS"
      },
      assertions: (output) => {
        assert.isNull(output);
      }
    });
    test({
      description: "Address with REP",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            callback("0x0000000000000000000000000000000000000000000000000000000000000042");
          }
        },
        address: "MY_ADDRESS"
      },
      assertions: (output) => {
        assert.strictEqual(output, "MY_ADDRESS");
      }
    });
  });
  describe("getAllRepAddresses", () => {
    const test = t => it(t.description, (done) => {
      lib.getAllRepAddresses(t.params.rpc, t.params.allRepAddresses, t.params.repAddressFile, t.params.fromBlock, (err, allRepAddresses) => {
        t.assertions(err, allRepAddresses);
        done();
      });
    });
    test({
      description: "One chunk, one log, one REP address",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            callback("0x0000000000000000000000000000000000000000000000000000000000000042");
          },
          getLogs: (p, callback) => {
            callback([{ topics: ["0x0", "0xf", "0x2"] }]);
          }
        },
        allRepAddresses: [],
        repAddressFile: TEST_REP_ADDRESS_FILE,
        fromBlock: 4050551
      },
      assertions: (err, allRepAddresses) => {
        assert.isNull(err);
        assert.deepEqual(allRepAddresses, ["0x0000000000000000000000000000000000000002"]);
      }
    });
  });
});
