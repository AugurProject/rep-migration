#!/usr/bin/env node

const path = require("path");
const rpc = require("ethrpc");
const getAllRepAddresses = require("./lib/all-rep-addresses").getAllRepAddresses;

const LEGACY_REP_CONTRACT_UPLOAD_BLOCK = 2378196;
const REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");
const allRepAddresses = [];

rpc.setDebugOptions({ connect: true, broadcast: false });

const startTime = Date.now();

rpc.connect({
  httpAddresses: ["http://127.0.0.1:8545"],
  wsAddresses: ["ws://127.0.0.1:8546"],
  ipcAddresses: [path.join(process.env.HOME, ".ethereum", "geth.ipc")],
  errorHandler: () => {}
}, () => {
  getAllRepAddresses(rpc, allRepAddresses, REP_ADDRESS_FILE, LEGACY_REP_CONTRACT_UPLOAD_BLOCK, (err) => {
    console.log("Time elapsed:", (Date.now() - startTime) / 1000 / 60, "minutes");
    if (err) console.error(err);
    process.exit(0);
  });
});
