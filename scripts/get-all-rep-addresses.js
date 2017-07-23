#!/usr/bin/env node

const path = require("path");
const rpc = require("ethrpc");
const constants = require("./constants");
const getAllRepAddresses = require("./lib/all-rep-addresses").getAllRepAddresses;

const allRepAddresses = [];

rpc.setDebugOptions({ connect: true, broadcast: false });

const startTime = Date.now();

rpc.connect({
  httpAddresses: ["http://127.0.0.1:8545"],
  wsAddresses: ["ws://127.0.0.1:8546"],
  ipcAddresses: [path.join(process.env.HOME, ".ethereum", "geth.ipc")],
  errorHandler: () => {}
}, () => {
  getAllRepAddresses(rpc, allRepAddresses, constants.LEGACY_REP_CONTRACT_ADDRESS, constants.REP_ADDRESS_FILE, constants.LEGACY_REP_CONTRACT_UPLOAD_BLOCK, constants.LEGACY_REP_FREEZE_BLOCK, constants.BLOCKS_PER_CHUNK, (err) => {
    console.log("Time elapsed:", (Date.now() - startTime) / 1000 / 60, "minutes");
    if (err) console.error(err);
    process.exit(0);
  });
});
