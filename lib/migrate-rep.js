const BigNumber = require("bignumber.js");
const async = require("async");
const constants = require("./constants");

let totalGasFees = new BigNumber(0);
let totalGas = new BigNumber(0);

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
    if (res.gasFees) totalGasFees = totalGasFees.plus(new BigNumber(res.gasFees, 10));
    if (res.gas) totalGas = totalGas.plus(new BigNumber(res.gas, 16));
    callback(null);
  }, err => callback(err));
}

function migrateRep(rpc, allRepAddresses, repContractAddress, senderAddress, callback) {
  console.log("Migrating REP...");
  const chunkedRepAddresses = chunkRepAddresses(allRepAddresses, constants.ADDRESSES_PER_CHUNK);
  async.each(chunkedRepAddresses, (repAddressChunk, nextRepAddressChunk) => {
    migrateRepChunk(rpc, repAddressChunk, repContractAddress, senderAddress, nextRepAddressChunk);
  }, (err) => {
    console.log("total gas fees:", totalGasFees.toFixed());
    console.log("total gas:", totalGas.toFixed());
    callback(err);
  });
}

module.exports.chunkRepAddresses = chunkRepAddresses;
module.exports.migrateRepChunk = migrateRepChunk;
module.exports.migrateRep = migrateRep;
