const path = require("path");
const abi = require("augur-abi");
const repFreeze = require("../data/rep-freeze.json");
const legacyRep = require("../data/legacy-rep.json");

module.exports.REP_CONTRACT_ADDRESS = ((require("../build/contracts/RepToken").networks || {})[process.env.EXPECTED_NETWORK_ID] || {}).address || "0x";

module.exports.LEGACY_REP_FREEZE_BLOCK = repFreeze.blockNumber;
module.exports.LEGACY_REP_FREEZE_ADDRESS = repFreeze.senderAddress;
module.exports.LEGACY_REP_FROZEN_REP_RECIPIENT_ADDRESS = "0xe1e212c353f7a682693c198ba5ff85849f8300cc";

module.exports.LEGACY_REP_CONTRACT_ADDRESS = (legacyRep[process.env.EXPECTED_NETWORK_ID] || {}).contractAddress;
module.exports.LEGACY_REP_CONTRACT_UPLOAD_BLOCK = (legacyRep[process.env.EXPECTED_NETWORK_ID] || {}).contractUploadBlock;

module.exports.LEGACY_REP_CREATION_OVERFLOW_DATA = "0xa9059cbb00000000000000000000000100000000000000000000000000000000000000060000000000000000000000000000000000000000000000000de0b6b3a7640000";
module.exports.LEGACY_REP_CREATION_OVERFLOW_AMOUNT = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";
module.exports.LEGACY_REP_TOTAL_SUPPLY = "0x00000000000000000000000000000000000000000009195731e2ce35eb000000";
module.exports.LEGACY_REP_TRANSFER_SIGNATURE = "0x" + abi.keccak_256("Transfer(address,address,uint256)");
module.exports.LEGACY_REP_TEST_TRANSFER_RECIPIENT = "0x15f6400a88fb320822b689607d425272bea2175f";

module.exports.ADDRESSES_PER_CHUNK = 25;
module.exports.PARALLEL_TRANSACTIONS = 10;
module.exports.BLOCKS_PER_CHUNK = 5000;
module.exports.REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses.txt");
