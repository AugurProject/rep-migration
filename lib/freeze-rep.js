const constants = require("./constants");

function freezeRep(rpc, senderAddress, callback) {
  rpc.transact({
    name: "transfer",
    data: constants.LEGACY_REP_CREATION_OVERFLOW_DATA,
    from: senderAddress,
    to: constants.LEGACY_REP_CONTRACT_ADDRESS,
    send: true
  }, null, res => console.log("freeze rep sent:", res), (res) => {
    console.log("freeze rep success:", res);
    callback(null);
  }, err => callback(err));
}

module.exports = freezeRep;
