#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const async = require("async");
const rpc = require("ethrpc");
const abi = require("augur-abi");

const LEGACY_REP_CONTRACT_ADDRESS = "0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5";
const LEGACY_REP_TRANSFER_SIGNATURE = "0x" + abi.keccak_256("Transfer(address,address,uint256)");
const LEGACY_REP_CONTRACT_UPLOAD_BLOCK = 2378196;
const LEGACY_REP_FREEZE_BLOCK = process.env.LEGACY_REP_FREEZE_BLOCK || 4046935;
const BLOCKS_PER_CHUNK = 5000;
const REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");

const allRepAddresses = [];

function writeAddressListToFile(callback) {
  fs.writeFile(REP_ADDRESS_FILE, allRepAddresses.join("\n"), "utf8", callback);
}

function checkRepBalance(address, callback) {
  rpc.callContractFunction({
    method: "balanceOf",
    params: [address],
    signature: ["address"],
    to: LEGACY_REP_CONTRACT_ADDRESS
  }, (repBalance) => {
    if (repBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      allRepAddresses.push(address);
    }
    callback();
  });
}

function getRepTransferLogsChunked(fromBlock, callback) {
  const toBlock = (fromBlock + BLOCKS_PER_CHUNK > LEGACY_REP_FREEZE_BLOCK) ? "latest" : fromBlock + BLOCKS_PER_CHUNK;
  rpc.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: LEGACY_REP_CONTRACT_ADDRESS,
    topics: [LEGACY_REP_TRANSFER_SIGNATURE]
  }, (logs) => {
    console.log("got", logs.length, "transfer logs between blocks", fromBlock, "and", toBlock);
    async.eachSeries(logs, (log, nextLog) => {
      const toAddress = abi.format_address(log.topics[2]);
      if (allRepAddresses.indexOf(toAddress) !== -1) return nextLog();
      checkRepBalance(toAddress, nextLog);
    }, () => {
      if (toBlock !== "latest") return getRepTransferLogsChunked(toBlock, callback);
      writeAddressListToFile(callback);
    });
  });
}

rpc.connect({
  httpAddresses: ["https://mainnet.infura.io/" + process.env.INFURA_TOKEN],
  wsAddresses: [],
  ipcAddresses: [],
  errorHandler: () => {}
}, () => {
  getRepTransferLogsChunked(LEGACY_REP_CONTRACT_UPLOAD_BLOCK, (err) => {
    if (err) console.error(err);
    process.exit(0);
  });
});
