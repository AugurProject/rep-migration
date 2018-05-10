#!/usr/bin/env node

const path = require("path");
const Augur = require("augur.js");
const augur = new Augur();
const unpause = require("../lib/unpause");

augur.rpc.setDebugOptions({ connect: true, broadcast: false });

augur.connect({
  httpAddresses: ["http://127.0.0.1:8545"],
  wsAddresses: ["ws://127.0.0.1:8546"],
  // ipcAddresses: [process.env.ETHEREUM_IPC || path.join(process.env.HOME, ".ethereum", "geth.ipc")],
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
