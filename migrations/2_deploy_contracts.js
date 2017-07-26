const BigNumber = require("bignumber.js");
const constants = require('../lib/constants')

const RepToken = artifacts.require('RepToken')
const LegacyRepToken = artifacts.require('LegacyRepToken')

async function deploy(deployer) {
  if (process.env.EXPECTED_NETWORK_ID === '1' || process.env.EXPECTED_NETWORK_ID === '3' || process.env.EXPECTED_NETWORK_ID === '4') {
    await deployer.deploy(RepToken, constants.LEGACY_REP_CONTRACT_ADDRESS)
  } else {
    await deployer.deploy(LegacyRepToken)
    const legacy = await LegacyRepToken.deployed()
    await deployer.deploy(RepToken, legacy.address, new BigNumber(10), constants.LEGACY_REP_FREEZE_ADDRESS);
  }
}

module.exports = function (deployer) {
  deploy(deployer).catch(console.error)
}
