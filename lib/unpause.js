const constants = require("./constants");

function unpause(rpc, senderAddress, callback) {
  const testTransferPayload = {
    name: "transfer",
    params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
    signature: ["address", "uint256"],
    from: senderAddress,
    to: constants.REP_CONTRACT_ADDRESS,
  };
  rpc.callContractFunction(testTransferPayload, (preFreezeTransferResponse) => {
    if (preFreezeTransferResponse === "0x0000000000000000000000000000000000000000000000000000000000000001") {
      return callback("Pre-unpause REP transfer succeeded (expected failure)");
    }
    rpc.transact({
      name: "unpause",
      from: senderAddress,
      to: constants.REP_CONTRACT_ADDRESS,
    }, null, res => console.log("unpause sent:", res), (res) => {
      console.log("unpause success:", res);
      rpc.callContractFunction(testTransferPayload, (postFreezeTransferResponse) => {
        if (postFreezeTransferResponse !== "0x0000000000000000000000000000000000000000000000000000000000000001") {
          return callback("Post-unpause REP transfer failed (expected success)");
        }
        callback(null);
      });
    }, err => callback(err));
  });
}

module.exports = unpause;
