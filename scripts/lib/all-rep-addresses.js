const fs = require("fs");
const path = require("path");
const async = require("async");
const abi = require("augur-abi");

const LEGACY_REP_CONTRACT_ADDRESS = "0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5";
const LEGACY_REP_TRANSFER_SIGNATURE = "0x" + abi.keccak_256("Transfer(address,address,uint256)");
const LEGACY_REP_FREEZE_BLOCK = parseInt(process.env.LEGACY_REP_FREEZE_BLOCK || 4051551, 10);
const BLOCKS_PER_CHUNK = 5000;

function writeAddressListToFile(repAddressFile, allRepAddresses, callback) {
  fs.writeFile(repAddressFile, allRepAddresses.join("\n"), "utf8", (err) => callback(err, allRepAddresses));
}

function checkRepBalance(rpc, address, callback) {
  rpc.callContractFunction({
    method: "balanceOf",
    params: [address],
    signature: ["address"],
    to: LEGACY_REP_CONTRACT_ADDRESS
  }, (repBalance) => {
    if (repBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      return callback(address);
    }
    callback(null);
  });
}

function getAllRepAddresses(rpc, allRepAddresses, repAddressFile, fromBlock, callback) {
  if (fromBlock > LEGACY_REP_FREEZE_BLOCK) {
    return writeAddressListToFile(repAddressFile, allRepAddresses, callback);
  }
  const toBlock = Math.min(fromBlock + BLOCKS_PER_CHUNK, LEGACY_REP_FREEZE_BLOCK);
  rpc.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: LEGACY_REP_CONTRACT_ADDRESS,
    topics: [LEGACY_REP_TRANSFER_SIGNATURE]
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
