#!/usr/bin/env node

const path = require("path");
const rpc = require("ethrpc");
const unpause = require("../lib/unpause");

rpc.setDebugOptions({ connect: true, broadcast: false });

rpc.connect({
  httpAddresses: ["http://127.0.0.1:8545"],
  wsAddresses: ["ws://127.0.0.1:8546"],
  ipcAddresses: [process.env.GETH_IPC || path.join(process.env.HOME, ".ethereum", "geth.ipc")],
  errorHandler: () => {},
}, () => {
  unpause(rpc, process.env.SENDER || rpc.getCoinbase(), (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
