#!/usr/bin/env node

const path = require("path");
const rpc = require("ethrpc");
const getAllRepAddresses = require("./lib/all-rep-addresses").getAllRepAddresses;

const LEGACY_REP_CONTRACT_UPLOAD_BLOCK = 2378196;
const REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");
const allRepAddresses = [];

// const LEGACY_REP_CONTRACT_UPLOAD_BLOCK = parseInt(process.env.LEGACY_REP_CONTRACT_UPLOAD_BLOCK || 2378196, 10);
// const allRepAddresses = fs.readFileSync(REP_ADDRESS_FILE, "utf8").split("\n");
// console.log("Loaded", allRepAddresses.length, "addresses");

rpc.connect({
  httpAddresses: ["https://mainnet.infura.io/" + process.env.INFURA_TOKEN],
  wsAddresses: [],
  ipcAddresses: [],
  errorHandler: () => {}
}, () => {
  getAllRepAddresses(rpc, allRepAddresses, REP_ADDRESS_FILE, LEGACY_REP_CONTRACT_UPLOAD_BLOCK, (err) => {
    if (err) console.error(err);
    process.exit(0);
  });
});
