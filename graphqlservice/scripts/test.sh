#!/bin/bash
set -e

# cd to project root directory
cd "$(dirname "$(dirname "$0")")"
source ./scripts/setup-environment.sh

scripts/run-dependencies.sh
yarn install
yarn test
scripts/stop-dependencies.sh
