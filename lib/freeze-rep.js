const fs = require("fs");
const constants = require("./constants");

function freezeRep(rpc, senderAddress, freezeRepFile, callback) {
  const testTransferPayload = {
    name: "transfer",
    params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
    signature: ["address", "uint256"],
    from: senderAddress,
    to: constants.LEGACY_REP_CONTRACT_ADDRESS
  };
  rpc.callContractFunction(testTransferPayload, (preFreezeTransferResponse) => {
    if (preFreezeTransferResponse !== "0x0000000000000000000000000000000000000000000000000000000000000001") {
      return callback("Pre-freeze REP transfer failed (expected success)");
    }
    rpc.transact({
      name: "transfer",
      data: constants.LEGACY_REP_CREATION_OVERFLOW_DATA,
      from: senderAddress,
      to: constants.LEGACY_REP_CONTRACT_ADDRESS
    }, null, res => console.log("freeze rep sent:", res), (res) => {
      console.log("freeze rep success:", res);
      rpc.callContractFunction(testTransferPayload, (postFreezeTransferResponse) => {
        if (postFreezeTransferResponse === "0x0000000000000000000000000000000000000000000000000000000000000001") {
          return callback("Post-freeze REP transfer succeeded (expected failure)");
        }
        const freezeRepData = {
          senderAddress: senderAddress,
          data: constants.LEGACY_REP_CREATION_OVERFLOW_DATA,
          blockNumber: res.blockNumber
        };
        fs.writeFile(freezeRepFile, JSON.stringify(freezeRepData, null, 2), callback);
      });
    }, err => callback(err));
  });
}

module.exports = freezeRep;
