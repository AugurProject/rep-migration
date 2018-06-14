#!/usr/bin/env node

const path = require("path");
const Augur = require("augur.js");
const constants = require("../lib/constants");
const getAllRepAllowances = require("../lib/get-all-rep-allowances").getAllRepAllowances;

const augur = new Augur();
augur.rpc.setDebugOptions({ connect: true, broadcast: false });

const ethereumNode = {
  http: process.env.ETHEREUM_HTTP || "http://127.0.0.1:8545",
  ws: process.env.ETHEREUM_WS || "ws://127.0.0.1:8546",
  ipc: process.env.ETHEREUM_IPC || path.join(process.env.HOME, ".ethereum", "geth.ipc"),
};
const augurNode = "";

const startTime = Date.now();

augur.connect({ ethereumNode, augurNode }, (err, connectionInfo) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  if (augur.rpc.getNetworkID() !== process.env.EXPECTED_NETWORK_ID) return process.exit(1);
  // const toBlock = constants.LEGACY_REP_FREEZE_BLOCK;
  const toBlock = parseInt(augur.rpc.getCurrentBlock().number, 16); // TODO: for production, replace this with the block number at which the REP contract was frozen
  getAllRepAllowances(augur, [], [], constants.LEGACY_REP_CONTRACT_ADDRESS, constants.REP_ALLOWANCE_OWNERS_FILE, constants.REP_ALLOWANCE_SPENDERS_FILE,constants.LEGACY_REP_CONTRACT_UPLOAD_BLOCK, toBlock, constants.BLOCKS_PER_CHUNK, (err) => {
    console.log("Time elapsed:", (Date.now() - startTime) / 1000 / 60, "minutes");
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
