#!/bin/bash

set -e

# SENDER=$SENDER GETH_IPC=$GETH_IPC node freeze-rep.js

truffle migrate --reset

GETH_IPC=$GETH_IPC node scripts/get-all-rep-addresses.js
SENDER=$SENDER GETH_IPC=$GETH_IPC node scripts/migrate-rep.js
GETH_IPC=$GETH_IPC node scripts/verify-rep-migration.js
