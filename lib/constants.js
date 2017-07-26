const path = require("path");
const abi = require("augur-abi");
const repFreeze = require(path.join(__dirname, "..", "data", "rep-freeze.json"));

module.exports.LEGACY_REP_FREEZE_BLOCK = repFreeze.blockNumber;
module.exports.LEGACY_REP_FREEZE_ADDRESS = repFreeze.senderAddress;

module.exports.REP_CONTRACT_ADDRESS = ((require("../build/contracts/RepToken").networks || {})[process.env.EXPECTED_NETWORK_ID] || {}).address;

switch (process.env.EXPECTED_NETWORK_ID) {
  case "1": // mainnet
    module.exports.LEGACY_REP_CONTRACT_ADDRESS = "0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5";
    module.exports.LEGACY_REP_CONTRACT_UPLOAD_BLOCK = 2378196;
    break;
  case "3": // ropsten
    module.exports.LEGACY_REP_CONTRACT_ADDRESS = "0x7f28321c01499ca33ab3bebde0d45f9b22b6c402";
    module.exports.LEGACY_REP_CONTRACT_UPLOAD_BLOCK = 1371481;
    break;
  case "4": // rinkeby
  default:
    module.exports.LEGACY_REP_CONTRACT_ADDRESS = "0x231dbbb4acfe9e7f81972e6901c2e49464b5ae7d";
    module.exports.LEGACY_REP_CONTRACT_UPLOAD_BLOCK = 590387;
}

module.exports.LEGACY_REP_CREATION_OVERFLOW_DATA = "0xa9059cbb00000000000000000000000100000000000000000000000000000000000000060000000000000000000000000000000000000000000000000de0b6b3a7640000";
module.exports.LEGACY_REP_TOTAL_SUPPLY = "0x00000000000000000000000000000000000000000009195731e2ce35eb000000";
module.exports.LEGACY_REP_TRANSFER_SIGNATURE = "0x" + abi.keccak_256("Transfer(address,address,uint256)");

module.exports.ADDRESSES_PER_CHUNK = 25;
module.exports.PARALLEL_TRANSACTIONS = 10;
module.exports.BLOCKS_PER_CHUNK = 5000;
module.exports.REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");
