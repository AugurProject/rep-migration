#!/usr/bin/env node

const path = require("path");
const Augur = require("augur.js");
const augur = new Augur();
const constants = require("../lib/constants");

augur.rpc.setDebugOptions({ connect: true, broadcast: false });

const startTime = Date.now();

augur.connect({
  httpAddresses: ["http://127.0.0.1:8545"],
  wsAddresses: ["ws://127.0.0.1:8546"],
  // ipcAddresses: [process.env.ETHEREUM_IPC || path.join(process.env.HOME, ".ethereum", "geth.ipc")],
  errorHandler: () => {},
}, () => {
  const testTransferPayload = {
    name: "transfer",
    params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
    signature: ["address", "uint256"],
    from: process.env.SENDER,
    to: constants.REP_CONTRACT_ADDRESS,
  };
  augur.rpc.callContractFunction(testTransferPayload, (testTransferResponse) => {
    console.log("Time elapsed:", (Date.now() - startTime) / 1000 / 60, "minutes");
    if (testTransferResponse !== "0x0000000000000000000000000000000000000000000000000000000000000001") {
      console.error("Test REP transfer failed");
      process.exit(1);
    }
    process.exit(0);
  });
});
