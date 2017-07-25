#!/usr/bin/env node

const fs = require("fs");
const Web3 = require("web3");
const RepToken = require(__dirname + "/../build/contracts/RepToken");
const LEGACY_REP_CONTRACT_ADDRESS = require(__dirname + "/../lib/constants").LEGACY_REP_CONTRACT_ADDRESS;

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const RepTokenContract = web3.eth.contract(RepToken.abi);

RepTokenContract.new([LEGACY_REP_CONTRACT_ADDRESS], { data: RepToken.unlinked_binary, from: process.env.SENDER, gas: 4000000 }, (err, contractInstance) => {
  if (contractInstance.address && process.env.EXPECTED_NETWORK_ID) {
    RepToken.networks[process.env.EXPECTED_NETWORK_ID].address = contractInstance.address;
    fs.writeFile(__dirname + "/../build/contracts/RepToken.json", JSON.stringify(RepToken, null, 2), (err) => {
      if (err) console.error(err);
      process.exit(0);
    });
  }
});
