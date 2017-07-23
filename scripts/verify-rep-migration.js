#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const rpc = require("ethrpc");
const verifyRepMigration = require("../lib/verify-rep-migration").verifyRepMigration;

const REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");

const allRepAddresses = fs.readFileSync(REP_ADDRESS_FILE, "utf8").split("\n");
console.log("Loaded", allRepAddresses.length, "addresses");

rpc.setDebugOptions({ connect: true, broadcast: false });

const startTime = Date.now();

rpc.connect({
  httpAddresses: ["http://127.0.0.1:8545"],
  wsAddresses: ["ws://127.0.0.1:8546"],
  ipcAddresses: [path.join(process.env.HOME, ".ethereum", "geth.ipc")],
  errorHandler: () => {}
}, () => {
  verifyRepMigration(rpc, allRepAddresses, (err) => {
    console.log("Time elapsed:", (Date.now() - startTime) / 1000 / 60, "minutes");
    if (err) console.error(err);
    process.exit(0);
  });
});
