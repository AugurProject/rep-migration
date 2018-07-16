const fs = require("fs");
const async = require("async");
const BigNumber = require("bignumber.js");
const speedomatic = require("speedomatic");
const path = require("path");
const Augur = require("augur.js");

const augur_address = "0x75228dce4d82566d93068a8d5d49435216551599";
const upload_block = 5926223;
const orders_files = "orders.txt"
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
  getAllOrderIds(augur, [], augur_address, orders_files, upload_block, toBlock, block_per_chunk, (err, orderIds) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

function writeAddressListToFile(orderAddressFile, allOrderIds, callback) {
  fs.writeFile(orderAddressFile, allOrderIds.join("\n"), "utf8", (err) => callback(err, allOrderIds));
}

function getAllOrderIds(augur, allOrderIds, augurAddress, orderAddressFile, fromBlock, endBlock, blocksPerChunk, callback) {
  if (fromBlock > endBlock) {
    console.log("Got ", allOrderIds.length, " Orders");
    return writeAddressListToFile(orderAddressFile, allOrderIds, callback);
  }
  const toBlock = Math.min(fromBlock + blocksPerChunk, endBlock);
  const eventInputs = [
    { type: "uint8" },    // 0 type
    { type: "uint256" },  // 1 amount
    { type: "uint256" },  // 2 price
    { type: "address" },  // creator INDEXED
    { type: "uint256" },  // 3 moneyEscrowed
    { type: "uint256" },  // 4 sharesEscrowed
    { type: "bytes32" },  // 5 tradeGroupId
    { type: "bytes32" },  // 6 orderId
    { type: "address" },  // universe INDEXED
    { type: "address" },  // shareToken INDEXED
  ]
  const abiEventInputs = [
    { type: "uint8" },    // 0 type
    { type: "uint256" },  // 1 amount
    { type: "uint256" },  // 2 price
    { type: "uint256" },  // 3 moneyEscrowed
    { type: "uint256" },  // 4 sharesEscrowed
    { type: "bytes32" },  // 5 tradeGroupId
    { type: "bytes32" },  // 6 orderId
  ]
  const eventSignature = augur.events.hashEventAbi({ name: "OrderCreated", inputs: eventInputs });
  augur.rpc.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: augurAddress,
    topics: [eventSignature],
  }, (err, logs) => {
    if (err) return callback(err);
    console.log("got", logs.length, "order created logs between blocks", fromBlock, "and", toBlock);
    if (!logs.length) return getAllOrderIds(augur, allOrderIds, augurAddress, orderAddressFile, toBlock + 1, endBlock, blocksPerChunk, callback);
    async.eachSeries(logs, (log, nextLog) => {
      var decodedData = speedomatic.abiDecodeData(abiEventInputs, log.data);
      allOrderIds.push(decodedData[6]);
      nextLog();
    }, (err) => {
      if (err) return callback(err);
      getAllOrderIds(augur, allOrderIds, augurAddress, orderAddressFile, toBlock + 1, endBlock, blocksPerChunk, callback);
    });
  });
}
