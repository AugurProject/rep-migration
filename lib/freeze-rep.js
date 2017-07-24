const constants = require("./constants");

function freezeRep(rpc, senderAddress, callback) {
  rpc.transact({
    name: "transfer",
    params: [
      constants.LEGACY_REP_CREATION_OVERFLOW_ADDRESS,
      constants.LEGACY_REP_CREATION_OVERFLOW_VALUE
    ],
    signature: ["int256", "uint256"],
    from: senderAddress,
    to: constants.LEGACY_REP_CONTRACT_ADDRESS,
    send: true
  }, null, res => console.log("freeze rep sent:", res), (res) => {
    console.log("freeze rep success:", res);
    callback(null);
  }, err => callback(err));
}

module.exports = freezeRep;
