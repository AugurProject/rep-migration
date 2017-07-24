const async = require("async");
const constants = require("./constants");

function chunkRepAddresses(allRepAddresses, addressesPerChunk) {
  const numChunks = Math.ceil(allRepAddresses.length / addressesPerChunk);
  const chunkedRepAddresses = new Array(numChunks);
  for (let i = 1; i <= numChunks; ++i) {
    chunkedRepAddresses[i - 1] = allRepAddresses.slice((i - 1) * addressesPerChunk, i * addressesPerChunk);
  }
  return chunkedRepAddresses;
}

function migrateRepChunk(rpc, repAddressChunk, repContractAddress, senderAddress, callback) {
  rpc.transact({
    name: "migrateBalances",
    params: [repAddressChunk],
    signature: ["address[]"],
    from: senderAddress,
    to: repContractAddress,
    send: true
  }, null,  res => console.log("sent:", res), (res) => {
    console.log("success:", res);
    callback(null);
  }, err => callback(err));
}

function migrateRep(rpc, allRepAddresses, repContractAddress, senderAddress, callback) {
  console.log("Migrating REP...");
  const chunkedRepAddresses = chunkRepAddresses(allRepAddresses, constants.ADDRESSES_PER_CHUNK);
  async.eachLimit(chunkedRepAddresses, constants.PARALLEL_TRANSACTIONS, (repAddressChunk, nextRepAddressChunk) => {
    migrateRepChunk(rpc, repAddressChunk, repContractAddress, senderAddress, nextRepAddressChunk);
  }, callback);
}

module.exports.chunkRepAddresses = chunkRepAddresses;
module.exports.migrateRepChunk = migrateRepChunk;
module.exports.migrateRep = migrateRep;
