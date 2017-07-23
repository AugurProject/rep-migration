const abi = require("augur-abi");

module.exports.REP_CONTRACT_ADDRESS = "0x";
module.exports.LEGACY_REP_CONTRACT_ADDRESS = "0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5";
module.exports.LEGACY_REP_TOTAL_SUPPLY = "0x0000000000000000000000000000000000000000000000000000000000a7d8c0";
module.exports.LEGACY_REP_TRANSFER_SIGNATURE = "0x" + abi.keccak_256("Transfer(address,address,uint256)");
module.exports.LEGACY_REP_FREEZE_BLOCK = parseInt(process.env.LEGACY_REP_FREEZE_BLOCK || 4051551, 10);
module.exports.ADDRESSES_PER_CHUNK = 100;
module.exports.PARALLEL_TRANSACTIONS = 10;
module.exports.BLOCKS_PER_CHUNK = 5000;
