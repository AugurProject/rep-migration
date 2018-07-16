const fs = require("fs");
const async = require("async");
const BigNumber = require("bignumber.js");
const speedomatic = require("speedomatic");
const path = require("path");
const Augur = require("augur.js");

const augur_address = "0x75228dce4d82566d93068a8d5d49435216551599";
const upload_block = 5926223;
const markets_file = "markets.txt"
const block_per_chunk = 5000;

const augur = new Augur();
augur.rpc.setDebugOptions({ connect: true, broadcast: false });

const ethereumNode = {
  http: process.env.ETHEREUM_HTTP || "http://127.0.0.1:8545",
  ws: process.env.ETHEREUM_WS || "ws://127.0.0.1:8546",
};
const augurNode = "";

augur.connect({ ethereumNode, augurNode }, (err, connectionInfo) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const toBlock = parseInt(augur.rpc.getCurrentBlock().number, 16);
  getAllMarketIds(augur, [], augur_address, markets_file, upload_block, toBlock, block_per_chunk, (err, marketIds) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

function writeAddressListToFile(marketAddressFile, allMarketIds, callback) {
  fs.writeFile(marketAddressFile, allMarketIds.join("\n"), "utf8", (err) => callback(err, allMarketIds));
}

function getAllMarketIds(augur, allMarketIds, augurAddress, marketAddressFile, fromBlock, endBlock, blocksPerChunk, callback) {
  if (fromBlock > endBlock) {
    console.log("Got ", allMarketIds.length, " Markets");
    return writeAddressListToFile(marketAddressFile, allMarketIds, callback);
  }
  const toBlock = Math.min(fromBlock + blocksPerChunk, endBlock);
  const eventInputs = [
    { type: "bytes32" },    // topic INDEXED
    { type: "string" },     // 0 description
    { type: "string" },     // 1 extraInfo
    { type: "address" },    // universe INDEXED
    { type: "address" },    // 2 market
    { type: "address" },    // marketCreator INDEXED
    { type: "bytes32[]" },  // 3 outcomes
    { type: "uint256" },    // 4 marketCreationFee
    { type: "int256" },     // 5 minPrice
    { type: "int256" },     // 6 maxPrice
    { type: "uint8" },      // 7 marketType
  ]
  const abiEventInputs = [
    { type: "string" },     // 0 description
    { type: "string" },     // 1 extraInfo
    { type: "address" },    // 2 market
    { type: "bytes32[]" },  // 3 outcomes
    { type: "uint256" },    // 4 marketCreationFee
    { type: "int256" },     // 5 minPrice
    { type: "int256" },     // 6 maxPrice
    { type: "uint8" },      // 7 marketType
  ]
  const eventSignature = augur.events.hashEventAbi({ name: "MarketCreated", inputs: eventInputs });
  augur.rpc.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: augurAddress,
    topics: [eventSignature],
  }, (err, logs) => {
    if (err) return callback(err);
    console.log("got", logs.length, "market created logs between blocks", fromBlock, "and", toBlock);
    if (!logs.length) return getAllMarketIds(augur, allMarketIds, augurAddress, marketAddressFile, toBlock + 1, endBlock, blocksPerChunk, callback);
    async.eachSeries(logs, (log, nextLog) => {
      var decodedData = speedomatic.abiDecodeData(abiEventInputs, log.data);
      allMarketIds.push(decodedData[2]);
      nextLog();
    }, (err) => {
      if (err) return callback(err);
      getAllMarketIds(augur, allMarketIds, augurAddress, marketAddressFile, toBlock + 1, endBlock, blocksPerChunk, callback);
    });
  });
}
