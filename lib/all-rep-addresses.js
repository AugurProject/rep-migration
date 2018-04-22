const fs = require("fs");
const async = require("async");
const abi = require("augur-abi");
const LEGACY_REP_TRANSFER_SIGNATURE = require("./constants").LEGACY_REP_TRANSFER_SIGNATURE;

let totalLegacyRepSupply = abi.bignum(0);

function writeAddressListToFile(repAddressFile, allRepAddresses, callback) {
  fs.writeFile(repAddressFile, allRepAddresses.join("\n"), "utf8", (err) => callback(err, allRepAddresses));
}

function checkRepBalance(rpc, address, legacyRepContractAddress, callback) {
  if (abi.strip_0x(address).length > 40) {
    console.log("skipping invalid address", address);
    return callback(null);
  }
  rpc.callContractFunction({
    name: "balanceOf",
    params: [address],
    signature: ["address"],
    to: legacyRepContractAddress,
  }, (repBalance) => {
    if (repBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      totalLegacyRepSupply = totalLegacyRepSupply.plus(abi.bignum(repBalance));
      return callback(address);
    }
    callback(null);
  });
}

function getAllRepAddresses(rpc, allRepAddresses, legacyRepContractAddress, repAddressFile, fromBlock, legacyRepFreezeBlock, blocksPerChunk, callback) {
  if (fromBlock > legacyRepFreezeBlock) {
    console.log("Total legacy REP supply:", totalLegacyRepSupply.toFixed());
    return writeAddressListToFile(repAddressFile, allRepAddresses, callback);
  }
  const toBlock = Math.min(fromBlock + blocksPerChunk, legacyRepFreezeBlock);
  rpc.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: legacyRepContractAddress,
    topics: [LEGACY_REP_TRANSFER_SIGNATURE],
  }, (logs) => {
    console.log("got", logs.length, "transfer logs between blocks", fromBlock, "and", toBlock);
    if (!logs.length) return getAllRepAddresses(rpc, allRepAddresses, legacyRepContractAddress, repAddressFile, toBlock + 1, legacyRepFreezeBlock, blocksPerChunk, callback);
    async.eachSeries(logs, (log, nextLog) => {
      const toAddress = abi.format_address(log.topics[2]);
      if (allRepAddresses.indexOf(toAddress) !== -1) return async.setImmediate(() => nextLog());
      checkRepBalance(rpc, toAddress, legacyRepContractAddress, (address) => {
        if (address) allRepAddresses.push(address);
        nextLog();
      });
    }, () => getAllRepAddresses(rpc, allRepAddresses, legacyRepContractAddress, repAddressFile, toBlock + 1, legacyRepFreezeBlock, blocksPerChunk, callback));
  });
}

module.exports.writeAddressListToFile = writeAddressListToFile;
module.exports.checkRepBalance = checkRepBalance;
module.exports.getAllRepAddresses = getAllRepAddresses;
