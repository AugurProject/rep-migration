const fs = require("fs");
const async = require("async");
const BigNumber = require("bignumber.js");
const speedomatic = require("speedomatic");

let totalLegacyRepSupply = new BigNumber(0);
// let totalMigrated = new BigNumber(0);

function writeAddressListToFile(repAddressFile, allRepAddresses, callback) {
  fs.writeFile(repAddressFile, allRepAddresses.join("\n"), "utf8", (err) => callback(err, allRepAddresses));
}

function checkRepBalance(augur, address, legacyRepContractAddress, callback) {
  if (speedomatic.strip0xPrefix(address).length > 40) {
    console.log("skipping invalid address", address);
    return callback(null);
  }
  augur.api.LegacyReputationToken.balanceOf({ _owner: address, tx: { to: legacyRepContractAddress } }, (err, repBalance) => {
    if (err) return callback(err);
    if (new BigNumber(repBalance, 10).gt(0)) {
      totalLegacyRepSupply = totalLegacyRepSupply.plus(new BigNumber(repBalance, 10));
      return callback(null, address);
    }
    callback(null);
  });
}

function getAllRepAddresses(augur, allRepAddresses, legacyRepContractAddress, repAddressFile, fromBlock, legacyRepFreezeBlock, blocksPerChunk, callback) {
  if (fromBlock > legacyRepFreezeBlock) {
    console.log("Total legacy REP supply:", totalLegacyRepSupply.toFixed(), speedomatic.unfix(totalLegacyRepSupply, "string"));
    return writeAddressListToFile(repAddressFile, allRepAddresses, callback);
  }
  const toBlock = Math.min(fromBlock + blocksPerChunk, legacyRepFreezeBlock);
  const migratedEventSignature = augur.events.hashEventAbi({ name: "Migrated", inputs: [{ type: "address" }, { type: "uint256" }] });
  augur.rpc.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: legacyRepContractAddress,
    topics: [[augur.contracts.abi.events.LegacyReputationToken.Transfer.signature, migratedEventSignature]],
  }, (err, logs) => {
    if (err) return callback(err);
    console.log("got", logs.length, "transfer or migrated logs between blocks", fromBlock, "and", toBlock);
    if (!logs.length) return getAllRepAddresses(augur, allRepAddresses, legacyRepContractAddress, repAddressFile, toBlock + 1, legacyRepFreezeBlock, blocksPerChunk, callback);
    async.eachSeries(logs, (log, nextLog) => {
      const toAddress = speedomatic.formatEthereumAddress((log.topics[0] === migratedEventSignature) ? log.topics[1] : log.topics[2]);
      if (allRepAddresses.indexOf(toAddress) !== -1) return async.setImmediate(() => nextLog());
      checkRepBalance(augur, toAddress, legacyRepContractAddress, (err, address) => {
        if (err) return nextLog(err);
        if (address) allRepAddresses.push(address);
        nextLog();
      });
    }, (err) => {
      if (err) return callback(err);
      getAllRepAddresses(augur, allRepAddresses, legacyRepContractAddress, repAddressFile, toBlock + 1, legacyRepFreezeBlock, blocksPerChunk, callback);
    });
  });
}

module.exports.writeAddressListToFile = writeAddressListToFile;
module.exports.checkRepBalance = checkRepBalance;
module.exports.getAllRepAddresses = getAllRepAddresses;
