const assert = require("chai").assert;
const BigNumber = require("bignumber.js");
const fs = require("fs");
const path = require("path");
const Augur = require("augur.js");
const augur = new Augur();
const constants = require("../lib/constants");
const lib = require("../lib/get-all-rep-addresses");

const LegacyRepToken = artifacts.require("LegacyRepToken");

const TEST_REP_ADDRESS_FILE = path.join(__dirname, "test-rep-address-file.txt");

describe("lib/get-all-rep-addresses", () => {
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
      lib.checkRepBalance(t.params.rpc, t.params.address, t.params.legacyRepContractAddress, t.assertions);
    });
    test({
      description: "Address without REP",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            callback("0x0000000000000000000000000000000000000000000000000000000000000000");
          }
        },
        address: "MY_ADDRESS",
        legacyRepContractAddress: constants.LEGACY_REP_CONTRACT_ADDRESS
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
        address: "MY_ADDRESS",
        legacyRepContractAddress: constants.LEGACY_REP_CONTRACT_ADDRESS
      },
      assertions: (output) => {
        assert.strictEqual(output, "MY_ADDRESS");
      }
    });
  });
  describe("getAllRepAddresses", () => {
    const test = t => it(t.description, (done) => {
      lib.getAllRepAddresses(t.params.rpc, t.params.allRepAddresses, t.params.legacyRepContractAddress, t.params.repAddressFile, t.params.fromBlock, t.params.legacyRepFreezeBlock, t.params.blocksPerChunk, (err, allRepAddresses) => {
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
        legacyRepContractAddress: constants.LEGACY_REP_CONTRACT_ADDRESS,
        repAddressFile: TEST_REP_ADDRESS_FILE,
        fromBlock: 10,
        legacyRepFreezeBlock: 11,
        blocksPerChunk: constants.BLOCKS_PER_CHUNK
      },
      assertions: (err, allRepAddresses) => {
        assert.isNull(err);
        assert.deepEqual(allRepAddresses, ["0x0000000000000000000000000000000000000002"]);
      }
    });
    test({
      description: "One chunk, two logs, one REP address",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            callback("0x0000000000000000000000000000000000000000000000000000000000000042");
          },
          getLogs: (p, callback) => {
            callback([
              { topics: ["0x0", "0xf", "0x2"] },
              { topics: ["0x0", "0xf", "0x2"] }
            ]);
          }
        },
        allRepAddresses: [],
        legacyRepContractAddress: constants.LEGACY_REP_CONTRACT_ADDRESS,
        repAddressFile: TEST_REP_ADDRESS_FILE,
        fromBlock: 10,
        legacyRepFreezeBlock: 11,
        blocksPerChunk: constants.BLOCKS_PER_CHUNK
      },
      assertions: (err, allRepAddresses) => {
        assert.isNull(err);
        assert.deepEqual(allRepAddresses, ["0x0000000000000000000000000000000000000002"]);
      }
    });
    test({
      description: "One chunk, two logs, two REP addresses",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            callback("0x0000000000000000000000000000000000000000000000000000000000000042");
          },
          getLogs: (p, callback) => {
            callback([
              { topics: ["0x0", "0xf", "0x2"] },
              { topics: ["0x0", "0xf", "0x1"] }
            ]);
          }
        },
        allRepAddresses: [],
        legacyRepContractAddress: constants.LEGACY_REP_CONTRACT_ADDRESS,
        repAddressFile: TEST_REP_ADDRESS_FILE,
        fromBlock: 10,
        legacyRepFreezeBlock: 11,
        blocksPerChunk: constants.BLOCKS_PER_CHUNK
      },
      assertions: (err, allRepAddresses) => {
        assert.isNull(err);
        assert.deepEqual(allRepAddresses, [
          "0x0000000000000000000000000000000000000002",
          "0x0000000000000000000000000000000000000001"
        ]);
      }
    });
    test({
      description: "Two chunks, five logs, three REP addresses",
      params: {
        rpc: {
          callContractFunction: (p, callback) => {
            callback("0x0000000000000000000000000000000000000000000000000000000000000042");
          },
          getLogs: (p, callback) => {
            if (p.fromBlock === 10) {
              callback([
                { topics: ["0x0", "0xf", "0x1"] },
                { topics: ["0x0", "0xf", "0x2"] },
                { topics: ["0x0", "0xf", "0x2"] }
              ]);
            } else {
              callback([
                { topics: ["0x0", "0xf", "0x3"] },
                { topics: ["0x0", "0xf", "0x2"] }
              ]);
            }
          }
        },
        allRepAddresses: [],
        legacyRepContractAddress: constants.LEGACY_REP_CONTRACT_ADDRESS,
        repAddressFile: TEST_REP_ADDRESS_FILE,
        fromBlock: 10,
        legacyRepFreezeBlock: 15,
        blocksPerChunk: 3
      },
      assertions: (err, allRepAddresses) => {
        assert.isNull(err);
        assert.deepEqual(allRepAddresses, [
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000002",
          "0x0000000000000000000000000000000000000003"
        ]);
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
    it("Should get transfer logs for 2 addresses", (done) => {
      augur.connect({
        httpAddresses: ["http://127.0.0.1:8545"],
        wsAddresses: [],
        ipcAddresses: [],
        errorHandler: () => {}
      }, () => {
        assert.notEqual(rpc.getNetworkID(), "1");
        augur.rpc.eth.blockNumber((blockNumber) => {
          lib.getAllRepAddresses(rpc, [], legacyRep.address, TEST_REP_ADDRESS_FILE, 0, parseInt(blockNumber, 16), constants.BLOCKS_PER_CHUNK, (err) => {
            assert.isNull(err);
            fs.readFile(TEST_REP_ADDRESS_FILE, "utf8", (err, allRepAddresses) => {
              assert.deepEqual(allRepAddresses.split("\n"), [nonZeroHolder1, nonZeroHolder2]);
              augur.rpc.resetState();
              done();
            });
          });
        });
      });
    });
  });
});
