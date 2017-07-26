#!/bin/bash

set -e
trap "exit" INT

startdir=$(pwd)

EXPECTED_NETWORK_ID=$EXPECTED_NETWORK_ID SENDER=$SENDER node "$startdir/scripts/deploy.js"
EXPECTED_NETWORK_ID=$EXPECTED_NETWORK_ID GETH_IPC=$GETH_IPC node "$startdir/scripts/get-all-rep-addresses.js"
EXPECTED_NETWORK_ID=$EXPECTED_NETWORK_ID SENDER=$SENDER GETH_IPC=$GETH_IPC node "$startdir/scripts/migrate-rep.js"
EXPECTED_NETWORK_ID=$EXPECTED_NETWORK_ID GETH_IPC=$GETH_IPC node "$startdir/scripts/verify-rep-migration.js"
EXPECTED_NETWORK_ID=$EXPECTED_NETWORK_ID SENDER=$SENDER GETH_IPC=$GETH_IPC node "$startdir/scripts/test-rep-transfer.js"
