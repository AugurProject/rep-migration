#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Augur = require("augur.js");
const augur = new Augur();
const constants = require("../lib/constants");
const migrateRep = require("../lib/migrate-rep").migrateRep;

const REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");

const allRepAddresses = fs.readFileSync(REP_ADDRESS_FILE, "utf8").split("\n");
console.log("Loaded", allRepAddresses.length, "addresses");

augur.rpc.setDebugOptions({ connect: true, broadcast: false });

const startTime = Date.now();

augur.connect({
  httpAddresses: ["http://127.0.0.1:8545"],
  wsAddresses: ["ws://127.0.0.1:8546"],
  // ipcAddresses: [process.env.ETHEREUM_IPC || path.join(process.env.HOME, ".ethereum", "geth.ipc")],
  errorHandler: () => {},
}, () => {
  migrateRep(rpc, allRepAddresses, constants.REP_CONTRACT_ADDRESS, process.env.SENDER || rpc.getCoinbase(), () => {}, (err) => {
    console.log("Time elapsed:", (Date.now() - startTime) / 1000 / 60, "minutes");
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
