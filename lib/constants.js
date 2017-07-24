const path = require("path");
const abi = require("augur-abi");

// module.exports.REP_CONTRACT_ADDRESS = "0x"; // mainnet
// module.exports.LEGACY_REP_CONTRACT_ADDRESS = "0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5"; // mainnet
// module.exports.LEGACY_REP_CONTRACT_UPLOAD_BLOCK = 2378196; // mainnet
// module.exports.LEGACY_REP_FREEZE_BLOCK = parseInt(process.env.LEGACY_REP_FREEZE_BLOCK || 4051551, 10); // mainnet

module.exports.REP_CONTRACT_ADDRESS = require("../build/contracts/RepToken").networks[4].address; // rinkeby
module.exports.LEGACY_REP_CONTRACT_ADDRESS = "0x231dbbb4acfe9e7f81972e6901c2e49464b5ae7d"; // rinkeby
module.exports.LEGACY_REP_CONTRACT_UPLOAD_BLOCK = 590387; // rinkeby
module.exports.LEGACY_REP_FREEZE_BLOCK = 591180; // rinkeby

module.exports.LEGACY_REP_CREATION_OVERFLOW_ADDRESS = "0x0000000000000000000000010000000000000000000000000000000000000006";
module.exports.LEGACY_REP_CREATION_OVERFLOW_VALUE = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";
module.exports.LEGACY_REP_TOTAL_SUPPLY = "0x0000000000000000000000000000000000000000000000000000000000a7d8c0";
module.exports.LEGACY_REP_TRANSFER_SIGNATURE = "0x" + abi.keccak_256("Transfer(address,address,uint256)");

module.exports.ADDRESSES_PER_CHUNK = 100;
module.exports.PARALLEL_TRANSACTIONS = 10;
module.exports.BLOCKS_PER_CHUNK = 5000;
module.exports.REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");
