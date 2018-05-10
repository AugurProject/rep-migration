#!/usr/bin/env node

const path = require("path");
const Augur = require("augur.js");
const freezeRep = require("../lib/freeze-rep");
const getPrivateKey = require("augur.js/scripts/lib/get-private-key").getPrivateKey;
const connectionEndpoints = require("augur.js/scripts/connection-endpoints");
const debugOptions = require("augur.js/scripts/debug-options");

const keystoreFilePath = process.argv[2];

const augur = new Augur();

augur.rpc.setDebugOptions(debugOptions);

const FREEZE_REP_FILE = path.join(__dirname, "..", "data", "freeze-rep.json");

const ethereumNode = {
  http: "http://127.0.0.1:8545",
  ws: "ws://127.0.0.1:8546",
  ipc: process.env.ETHEREUM_IPC || path.join(process.env.HOME, ".ethereum", "geth.ipc"),
};
const augurNode = "";

getPrivateKey(keystoreFilePath, function (err, auth) {
  if (err) return console.error("getPrivateKey failed:", err);
  augur.connect(connectionEndpoints, function (err) {
    if (err) return console.error(err);
    var senderAddress = auth.address;
    if (augur.rpc.getNetworkID() !== process.env.EXPECTED_NETWORK_ID) return process.exit(1);
    console.log("sender:", senderAddress);
    console.log("network:", augur.rpc.getNetworkID());
    freezeRep(augur, senderAddress, FREEZE_REP_FILE, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      process.exit(0);
    });
  });
});
