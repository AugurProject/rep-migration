const assert = require("chai").assert;
const BigNumber = require("bignumber.js");
const fs = require("fs");
const path = require("path");
const Augur = require("augur.js");
const augur = new Augur();
const constants = require("../lib/constants");
const lib = require("../lib/get-all-rep-allowances");

const LegacyRepToken = artifacts.require("LegacyRepToken");

const TEST_REP_OWNERS_FILE = path.join(__dirname, "test-rep-allowance-owners-file.txt");
const TEST_REP_SPENDERS_FILE = path.join(__dirname, "test-rep-allowance-spenders-file.txt");

describe("lib/get-all-rep-addresses", () => {
  contract("RepToken", function ([_, owner, zeroHolder, nonZeroHolder1, nonZeroHolder2]) {
    const nonZeroAmount1 = new BigNumber(4000, 10);
    const nonZeroAmount2 = new BigNumber(8000, 10);
    const totalAmount = nonZeroAmount1.plus(nonZeroAmount2);
    let legacyRep;
    before(async function () {
      legacyRep = await LegacyRepToken.new({ from: owner });
      await legacyRep.assign(zeroHolder, totalAmount);
      await legacyRep.unpause({ from: owner });
      await legacyRep.approve(nonZeroHolder1, nonZeroAmount1, { from: zeroHolder });
      await legacyRep.approve(nonZeroHolder2, nonZeroAmount2, { from: zeroHolder });
    });
    it("Should get approval logs for 2 addresses", (done) => {
      augur.connect({
        httpAddresses: ["http://127.0.0.1:8545"],
        wsAddresses: [],
        ipcAddresses: [],
        errorHandler: () => {}
      }, () => {
        assert.notEqual(rpc.getNetworkID(), "1");
        augur.rpc.eth.blockNumber((blockNumber) => {
          lib.getAllRepAllowances(rpc, [], [], legacyRep.address, TEST_REP_OWNERS_FILE, TEST_REP_SPENDERS_FILE, 0, parseInt(blockNumber, 16), constants.BLOCKS_PER_CHUNK, (err) => {
            assert.isNull(err);
            fs.readFile(TEST_REP_OWNERS_FILE, "utf8", (err, allRepAddresses) => {
              assert.deepEqual(allRepAddresses.split("\n"), [nonZeroHolder1, nonZeroHolder2]);
              fs.readFile(TEST_REP_SPENDERS_FILE, "utf8", (err, allRepAddresses) => {
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
});
