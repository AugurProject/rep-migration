const { LEGACY_REP_CONTRACT_ADDRESS } = require('../lib/constants');

const RepToken = artifacts.require('RepToken')
const LegacyRepToken = artifacts.require('LegacyRepToken')

async function deploy(deployer) {
  // await deployer.deploy(LegacyRepToken)

  // const legacy = await LegacyRepToken.deployed()

  // await deployer.deploy(RepToken, legacy.address);
  await deployer.deploy(RepToken, LEGACY_REP_CONTRACT_ADDRESS);
}

module.exports = function (deployer) {
  deploy(deployer).catch(console.error)
}
