const fs = require("fs");
const path = require("path");
const async = require("async");
const abi = require("augur-abi");
const constants = require("./constants");

function writeAddressListToFile(repAddressFile, allRepAddresses, callback) {
  fs.writeFile(repAddressFile, allRepAddresses.join("\n"), "utf8", (err) => callback(err, allRepAddresses));
}

function checkRepBalance(rpc, address, callback) {
  rpc.callContractFunction({
    name: "balanceOf",
    params: [address],
    signature: ["address"],
    to: constants.LEGACY_REP_CONTRACT_ADDRESS
  }, (repBalance) => {
    if (repBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      return callback(address);
    }
    callback(null);
  });
}

function getAllRepAddresses(rpc, allRepAddresses, repAddressFile, fromBlock, callback) {
  if (fromBlock > constants.LEGACY_REP_FREEZE_BLOCK) {
    return writeAddressListToFile(repAddressFile, allRepAddresses, callback);
  }
  const toBlock = Math.min(fromBlock + constants.BLOCKS_PER_CHUNK, constants.LEGACY_REP_FREEZE_BLOCK);
  rpc.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: constants.LEGACY_REP_CONTRACT_ADDRESS,
    topics: [constants.LEGACY_REP_TRANSFER_SIGNATURE]
  }, (logs) => {
    console.log("got", logs.length, "transfer logs between blocks", fromBlock, "and", toBlock);
    if (!logs.length) return getAllRepAddresses(rpc, allRepAddresses, repAddressFile, toBlock + 1, callback);
    async.eachSeries(logs, (log, nextLog) => {
      const toAddress = abi.format_address(log.topics[2]);
      if (allRepAddresses.indexOf(toAddress) !== -1) return nextLog();
      checkRepBalance(rpc, toAddress, (address) => {
        if (address) allRepAddresses.push(address);
        nextLog();
      });
    }, () => getAllRepAddresses(rpc, allRepAddresses, repAddressFile, toBlock + 1, callback));
  });
}

module.exports.writeAddressListToFile = writeAddressListToFile;
module.exports.checkRepBalance = checkRepBalance;
module.exports.getAllRepAddresses = getAllRepAddresses;
