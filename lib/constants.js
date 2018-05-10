const path = require("path");
const freezeRep = require("../data/freeze-rep.json");
const legacyRep = require("../data/legacy-rep.json");

// const networkID = augur.rpc.getNetworkID();
// const universe = augur.contracts.addresses[networkID].Universe;
// module.exports.REP_CONTRACT_ADDRESS = augur.api.Universe.getReputationToken({ universe }, (err, reputationToken) => {
//   if (err) return console.error(err);
//   module.exports.REP_CONTRACT_ADDRESS = reputationToken;
// });

module.exports.LEGACY_REP_FREEZE_BLOCK = freezeRep.blockNumber;
module.exports.LEGACY_REP_FREEZE_ADDRESS = freezeRep.senderAddress;

const networkID = process.env.EXPECTED_NETWORK_ID;

module.exports.LEGACY_REP_CONTRACT_ADDRESS = legacyRep[networkID].contractAddress;
module.exports.LEGACY_REP_CONTRACT_UPLOAD_BLOCK = legacyRep[networkID].contractUploadBlock;
// module.exports.LEGACY_REP_CONTRACT_ADDRESS = augur.contracts.addresses[networkID].LegacyReputationToken;
// module.exports.LEGACY_REP_CONTRACT_UPLOAD_BLOCK = augur.contracts.uploadBlockNumbers[networkID];

module.exports.LEGACY_REP_TOTAL_SUPPLY = "0x00000000000000000000000000000000000000000009195731e2ce35eb000000";
// module.exports.LEGACY_REP_TRANSFER_SIGNATURE = augur.contracts.abi.events.LegacyReputationToken.Transfer.signature;
module.exports.LEGACY_REP_TEST_TRANSFER_RECIPIENT = "0x7c0d52faab596c08f484e3478aebc6205f3f5d8c";

module.exports.ADDRESSES_PER_CHUNK = 25;
module.exports.PARALLEL_TRANSACTIONS = 50;
module.exports.BLOCKS_PER_CHUNK = 5000;
module.exports.REP_ADDRESS_FILE = path.join(__dirname, "..", "data", "all-rep-addresses-" + process.env.EXPECTED_NETWORK_ID + ".txt");
