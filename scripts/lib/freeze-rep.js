const BigNumber = require("bignumber.js");
const constants = require("./constants");

function freezeRep(rpc, callback) {
  rpc.transact({
    name: "transfer",
    params: [
      constants.LEGACY_REP_CREATION_OVERFLOW_ADDRESS,
      constants.LEGACY_REP_CREATION_OVERFLOW_VALUE
    ],
    signature: ["address", "uint256"],
    from: rpc.getCoinbase(),
    to: constants.LEGACY_REP_CONTRACT_ADDRESS,
    onSent: () => {},
    onSuccess: (res) => {
      console.log("freeze rep success:", res);
      callback(null);
    },
    onFailed: err => callback(err)
  });
}

module.exports = freezeRep;
