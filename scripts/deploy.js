#!/usr/bin/env node

const fs = require("fs");
const BigNumber = require("bignumber.js");
const Web3 = require("web3");
const RepToken = require(__dirname + "/../build/contracts/RepToken");
const constants = require(__dirname + "/../lib/constants");

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const RepTokenContract = web3.eth.contract(RepToken.abi);

const networkID = process.env.EXPECTED_NETWORK_ID;

RepTokenContract.new(constants.LEGACY_REP_CONTRACT_ADDRESS, new BigNumber("10", 10).toPower(18), constants.LEGACY_REP_FROZEN_REP_RECIPIENT_ADDRESS, {
  data: RepToken.unlinked_binary,
  from: process.env.SENDER,
  gas: 4000000,
}, (err, contractInstance) => {
  if (contractInstance && contractInstance.address && networkID) {
    if (!RepToken.networks[networkID]) RepToken.networks[networkID] = {};
    RepToken.networks[networkID].address = contractInstance.address;
    fs.writeFile(__dirname + "/../build/contracts/RepToken.json", JSON.stringify(RepToken, null, 2), (err) => {
      if (err) console.error(err);
      process.exit(0);
    });
  }
});
