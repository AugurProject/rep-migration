#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const rpc = require("ethrpc");
const abi = require("augur-abi");

const legacyRepContractAddress = "0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5";
const legacyRepTransferSignature = "0x" + abi.keccak_256("Transfer(address,address,uint256)");
const legacyRepContractUploadBlock = 2378196;
const legacyRepFreezeBlock = 4046935;

const REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");
const BLOCKS_PER_CHUNK = 5000;

const allRepAddresses = [];

function writeAddressListToFile(callback) {
  fs.writeFile(REP_ADDRESS_FILE, allRepAddresses.join("\n"), "utf8", callback);
}

function getRepTransferLogsChunked(fromBlock, callback) {
  const toBlock = (fromBlock + BLOCKS_PER_CHUNK > legacyRepFreezeBlock) ? "latest" : fromBlock + BLOCKS_PER_CHUNK;
  const filter = {
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: legacyRepContractAddress,
    topics: [legacyRepTransferSignature]
  };
  rpc.getLogs(filter, (logs) => {
    console.log("got", logs.length, "transfer logs between blocks", fromBlock, "and", toBlock);
    logs.forEach((log) => {
      const toAddress = abi.format_address(log.topics[2]);
      if (allRepAddresses.indexOf(toAddress) === -1) {
        rpc.callContractFunction({
          method: "balanceOf",
          params: [toAddress],
          signature: ["address"],
          to: legacyRepContractAddress
        }, (toAddressRepBalance) => {
          if (toAddressRepBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
            allRepAddresses.push(toAddress);
          }
        });
      }
    });
    if (toBlock !== "latest") return getRepTransferLogsChunked(toBlock, callback);
    writeAddressListToFile(callback);
  });
}

rpc.connect({
  httpAddresses: ["https://mainnet.infura.io/" + process.env.INFURA_TOKEN],
  wsAddresses: [],
  ipcAddresses: [],
  errorHandler: () => {}
}, () => {
  getRepTransferLogsChunked(legacyRepContractUploadBlock, (err) => {
    if (err) console.error(err);
    process.exit(0);
  });
});
