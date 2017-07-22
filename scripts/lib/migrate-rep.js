const async = require("async");

const REP_CONTRACT_ADDRESS = "0x";
const LEGACY_REP_CONTRACT_ADDRESS = "0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5";
const LEGACY_REP_TOTAL_SUPPLY = "0x0000000000000000000000000000000000000000000000000000000000a7d8c0";
const ADDRESSES_PER_CHUNK = 100;
const PARALLEL_TRANSACTIONS = 10;

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
    to: REP_CONTRACT_ADDRESS,
    returns: "null",
    onSent: () => {},
    onSuccess: (res) => {
      console.log("success:", res);
      callback(null);
    },
    onFailed: err => callback(err)
  });
}

function verifySingleAddressRepMigration(rpc, repAddress, callback) {
  const balanceOf = {
    name: "balanceOf",
    params: [repAddress],
    signature: ["address"]
  };
  async.parallel({
    new: (next) => rpc.callContractFunction(Object.assign({}, balanceOf, {
      to: REP_CONTRACT_ADDRESS
    }), newRepBalance => next(null, newRepBalance)),
    old: (next) => rpc.callContractFunction(Object.assign({}, balanceOf, {
      to: LEGACY_REP_CONTRACT_ADDRESS
    }), oldRepBalance => next(null, oldRepBalance))
  }, (_, repBalances) => {
    if (repBalances.old !== repBalances.new) {
      return callback("Inconsistent balances for address " + repAddress + ": " + repBalances.old + " " + repBalances.new);
    }
    callback(null);
  });
}

function verifyRepMigration(rpc, allRepAddresses, callback) {
  rpc.callContractFunction({
    name: "totalSupply",
    to: REP_CONTRACT_ADDRESS
  }, (totalSupply) => {
    if (totalSupply !== LEGACY_REP_TOTAL_SUPPLY) return callback(false);
    async.eachSeries(allRepAddresses, (repAddress, nextRepAddress) => {
      verifyAddressRepMigration(rpc, repAddress, nextRepAddress);
    }, (err) => {
      if (err) console.error(err);
      callback(null);
    });
  });
}

function migrateRep(rpc, allRepAddresses, callback) {
  const chunkedRepAddresses = chunkRepAddresses(allRepAddresses, ADDRESSES_PER_CHUNK);
  async.eachLimit(chunkedRepAddresses, PARALLEL_TRANSACTIONS, (repAddressChunk, nextRepAddressChunk) => {
    migrateRepChunk(rpc, repAddressChunk, nextRepAddressChunk);
  }, (err) => {
    if (err) return callback(err);
    verifyRepMigration(rpc, allRepAddresses, callback);
  });
}

module.exports.REP_CONTRACT_ADDRESS = REP_CONTRACT_ADDRESS;
module.exports.chunkRepAddresses = chunkRepAddresses;
module.exports.migrateRepChunk = migrateRepChunk;
module.exports.verifySingleAddressRepMigration = verifySingleAddressRepMigration;
module.exports.verifyRepMigration = verifyRepMigration;
module.exports.migrateRep = migrateRep;
