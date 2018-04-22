const async = require("async");
const constants = require("./constants");

function verifySingleAddressRepMigration(rpc, repAddress, callback) {
  const balanceOf = {
    name: "balanceOf",
    params: [repAddress],
    signature: ["address"],
  };
  async.parallel({
    new: (next) => rpc.callContractFunction(Object.assign({}, balanceOf, {
      to: constants.REP_CONTRACT_ADDRESS,
    }), newRepBalance => next(null, newRepBalance)),
    old: (next) => rpc.callContractFunction(Object.assign({}, balanceOf, {
      to: constants.LEGACY_REP_CONTRACT_ADDRESS,
    }), oldRepBalance => next(null, oldRepBalance)),
  }, (_, repBalances) => {
    if (repBalances.old !== repBalances.new) {
      return callback("Inconsistent balances for address " + repAddress + ": " + repBalances.old + " " + repBalances.new);
    }
    callback(null);
  });
}

function verifyRepMigration(rpc, allRepAddresses, callback) {
  console.log("Verifying REP balances match...");
  rpc.callContractFunction({
    name: "totalSupply",
    to: constants.REP_CONTRACT_ADDRESS,
  }, (totalSupply) => {
    if (totalSupply !== constants.LEGACY_REP_TOTAL_SUPPLY) {
      return callback("Inconsistent total supply: " + constants.LEGACY_REP_TOTAL_SUPPLY + " " + totalSupply);
    }
    async.eachLimit(allRepAddresses, constants.PARALLEL_TRANSACTIONS, (repAddress, nextRepAddress) => {
      verifySingleAddressRepMigration(rpc, repAddress, nextRepAddress);
    }, callback);
  });
}

module.exports.verifySingleAddressRepMigration = verifySingleAddressRepMigration;
module.exports.verifyRepMigration = verifyRepMigration;
