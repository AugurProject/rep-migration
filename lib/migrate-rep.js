const BigNumber = require("bignumber.js");
const async = require("async");
const constants = require("./constants");

let totalGasFees = new BigNumber(0);
let totalGas = new BigNumber(0);
let numTransactions = 0;
let numAddresses = 0;

function chunkRepAddresses(allRepAddresses, addressesPerChunk) {
  const numChunks = Math.ceil(allRepAddresses.length / addressesPerChunk);
  const chunkedRepAddresses = new Array(numChunks);
  for (let i = 1; i <= numChunks; ++i) {
    chunkedRepAddresses[i - 1] = allRepAddresses.slice((i - 1) * addressesPerChunk, i * addressesPerChunk);
  }
  return chunkedRepAddresses;
}

function migrateRepChunk(rpc, repAddressChunk, repContractAddress, senderAddress, onSent, callback) {
  rpc.transact({
    name: "migrateBalances",
    params: [repAddressChunk],
    signature: ["address[]"],
    from: senderAddress,
    to: repContractAddress,
    send: true
  }, null,  onSent, (res) => {
    numTransactions++;
    numAddresses += repAddressChunk.length;
    if (!res.gasFees) return callback(null);
    totalGasFees = totalGasFees.plus(new BigNumber(res.gasFees, 10));
    rpc.getTransactionReceipt(res.hash, (receipt) => {
      totalGas = totalGas.plus(new BigNumber(receipt.gasUsed, 10));
      callback(null);
    });
  }, err => callback(err));
}

function migrateRep(rpc, allRepAddresses, repContractAddress, senderAddress, onSent, callback) {
  console.log("Migrating REP...");
  const chunkedRepAddresses = chunkRepAddresses(allRepAddresses, constants.ADDRESSES_PER_CHUNK);
  async.eachLimit(chunkedRepAddresses, constants.PARALLEL_TRANSACTIONS, (repAddressChunk, nextRepAddressChunk) => {
    migrateRepChunk(rpc, repAddressChunk, repContractAddress, senderAddress, onSent, nextRepAddressChunk);
  }, (err) => {
    console.log("total gas fees:", totalGasFees.toFixed(), "ETH");
    console.log("total gas:", totalGas.toFixed());
    console.log("total transactions:", numTransactions);
    console.log("total addresses:", numAddresses);
    callback(err);
  });
}

module.exports.chunkRepAddresses = chunkRepAddresses;
module.exports.migrateRepChunk = migrateRepChunk;
module.exports.migrateRep = migrateRep;
