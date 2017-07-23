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

function migrateRepChunk(rpc, repAddressChunk, callback) {
  rpc.transact({
    name: "migrateBalances",
    params: repAddressChunk,
    signature: ["address[]"],
    from: rpc.getCoinbase(),
    to: constants.REP_CONTRACT_ADDRESS,
    returns: "null",
    onSent: () => {},
    onSuccess: (res) => {
      console.log("success:", res);
      callback(null);
    },
    onFailed: err => callback(err)
  });
}

function migrateRep(rpc, allRepAddresses, callback) {
  console.log("Migrating REP...");
  const chunkedRepAddresses = chunkRepAddresses(allRepAddresses, constants.ADDRESSES_PER_CHUNK);
  async.eachLimit(chunkedRepAddresses, constants.PARALLEL_TRANSACTIONS, (repAddressChunk, nextRepAddressChunk) => {
    migrateRepChunk(rpc, repAddressChunk, nextRepAddressChunk);
  }, callback);
}

module.exports.chunkRepAddresses = chunkRepAddresses;
module.exports.migrateRepChunk = migrateRepChunk;
module.exports.migrateRep = migrateRep;
