const LEGACY_REP_CONTRACT_ADDRESS = require('../lib/constants').LEGACY_REP_CONTRACT_ADDRESS

const RepToken = artifacts.require('RepToken')

async function deploy(deployer) {
  await deployer.deploy(RepToken, LEGACY_REP_CONTRACT_ADDRESS)
}

module.exports = function (deployer) {
  deploy(deployer).catch(console.error)
}
