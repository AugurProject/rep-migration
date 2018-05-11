const fs = require("fs");
const async = require("async");
const BigNumber = require("bignumber.js");
const speedomatic = require("speedomatic");

function writeAddressListsToFiles(ownerFile, spenderFile, owners, spenders, callback) {
  try {
    fs.writeFileSync(ownerFile, owners.join("\n"), "utf8");
    fs.writeFileSync(spenderFile, spenders.join("\n"), "utf8");
  } catch (err) {
    return callback(err);
  }
  return callback(null);
}

function checkRepAllowance(augur, owner, spender, legacyRepContractAddress, callback) {
  if (speedomatic.strip0xPrefix(owner).length > 40 || speedomatic.strip0xPrefix(spender).length > 40) {
    console.log(`skipping invalid addresses ${owner} ${spender}`);
    return callback(null);
  }
  augur.api.LegacyReputationToken.allowance({ _owner: owner, _spender: spender, tx: { to: legacyRepContractAddress } }, (err, repAllowance) => {
    if (err) return callback(err);
    if (new BigNumber(repAllowance, 10).gt(0)) {
      return callback(null, owner, spender);
    }
    callback(null);
  });
}

function getAllRepAllowances(augur, allOwners, allSpenders, legacyRepContractAddress, ownersFile, spendersFile, fromBlock, legacyRepFreezeBlock, blocksPerChunk, callback) {
  if (fromBlock > legacyRepFreezeBlock) {
    return writeAddressListsToFiles(ownersFile, spendersFile, allOwners, allSpenders, callback);
  }
  const toBlock = Math.min(fromBlock + blocksPerChunk, legacyRepFreezeBlock);
  augur.rpc.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: legacyRepContractAddress,
    topics: [[augur.contracts.abi.events.LegacyReputationToken.Approval.signature]],
  }, (err, logs) => {
    if (err) return callback(err);
    console.log("got", logs.length, "approval logs between blocks", fromBlock, "and", toBlock);
    if (!logs.length) return getAllRepAllowances(augur, allOwners, allSpenders, legacyRepContractAddress, ownersFile, spendersFile, toBlock + 1, legacyRepFreezeBlock, blocksPerChunk, callback);
    async.eachSeries(logs, (log, nextLog) => {
      const logOwner = speedomatic.formatEthereumAddress(log.topics[1]);
      const logSpender = speedomatic.formatEthereumAddress(log.topics[2]);
      if (allOwners.indexOf(logOwner) !== -1 && allSpenders.indexOf(logSpender) !== -1) return async.setImmediate(() => nextLog());
      checkRepAllowance(augur, logOwner, logSpender, legacyRepContractAddress, (err, owner, spender) => {
        if (err) return nextLog(err);
        if (owner) {
            allOwners.push(owner);
            allSpenders.push(spender);
        }
        nextLog();
      });
    }, (err) => {
      if (err) return callback(err);
      getAllRepAllowances(augur, allOwners, allSpenders, legacyRepContractAddress, ownersFile, spendersFile, toBlock + 1, legacyRepFreezeBlock, blocksPerChunk, callback);
    });
  });
}

module.exports.getAllRepAllowances = getAllRepAllowances;
