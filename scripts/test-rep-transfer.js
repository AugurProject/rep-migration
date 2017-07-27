#!/usr/bin/env node

const path = require("path");
const rpc = require("ethrpc");
const constants = require("../lib/constants");

rpc.setDebugOptions({ connect: true, broadcast: false });

const startTime = Date.now();

rpc.connect({
  httpAddresses: ["http://127.0.0.1:8545"],
  wsAddresses: ["ws://127.0.0.1:8546"],
  ipcAddresses: [process.env.GETH_IPC || path.join(process.env.HOME, ".ethereum", "geth.ipc")],
  errorHandler: () => {}
}, () => {
  const testTransferPayload = {
    name: "transfer",
    params: [constants.LEGACY_REP_TEST_TRANSFER_RECIPIENT, "0x1"],
    signature: ["address", "uint256"],
    from: process.env.SENDER,
    to: constants.REP_CONTRACT_ADDRESS
  };
  rpc.callContractFunction(testTransferPayload, (testTransferResponse) => {
    console.log("Time elapsed:", (Date.now() - startTime) / 1000 / 60, "minutes");
    if (testTransferResponse !== "0x0000000000000000000000000000000000000000000000000000000000000001") {
      throw new Error("Test REP transfer failed");
    }
    process.exit(0);
  });
});
