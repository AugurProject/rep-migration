#!/bin/bash

set -ex
trap "exit" INT

startdir=$(pwd)

# truffle compile
# EXPECTED_NETWORK_ID=$EXPECTED_NETWORK_ID SENDER=$SENDER node "$startdir/scripts/deploy.js"

# 1. Freeze legacy REP contract

# 2. Deploy Augur contracts
EXPECTED_NETWORK_ID=$EXPECTED_NETWORK_ID ETHEREUM_IPC=$ETHEREUM_IPC node "$startdir/scripts/get-all-rep-addresses.js"
EXPECTED_NETWORK_ID=$EXPECTED_NETWORK_ID SENDER=$SENDER ETHEREUM_IPC=$ETHEREUM_IPC node "$startdir/scripts/migrate-rep.js"
EXPECTED_NETWORK_ID=$EXPECTED_NETWORK_ID ETHEREUM_IPC=$ETHEREUM_IPC node "$startdir/scripts/verify-rep-migration.js"
