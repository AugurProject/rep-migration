#!/usr/bin/env node

const path = require("path");
const rpc = require("ethrpc");
const getAllRepAddresses = require("./lib/all-rep-addresses").getAllRepAddresses;

const LEGACY_REP_CONTRACT_UPLOAD_BLOCK = 2378196;
const REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");
const allRepAddresses = [];

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
