const fs = require("fs");
const constants = require("./constants");

function freezeRep(rpc, senderAddress, freezeRepFile, callback) {
  rpc.transact({
    name: "transfer",
    data: constants.LEGACY_REP_CREATION_OVERFLOW_DATA,
    from: senderAddress,
    to: constants.LEGACY_REP_CONTRACT_ADDRESS,
    send: true
  }, null, res => console.log("freeze rep sent:", res), (res) => {
    console.log("freeze rep success:", res);
    fs.writeFile(freezeRepFile, JSON.stringify({
      senderAddress: senderAddress,
      data: constants.LEGACY_REP_CREATION_OVERFLOW_DATA,
      blockNumber: parseInt(res.blockNumber, 16),
    }, null, 2), callback);
  }, err => callback(err));
}

module.exports = freezeRep;
