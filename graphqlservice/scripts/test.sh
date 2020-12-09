#!/bin/bash
set -e

# cd to project root directory
cd "$(dirname "$(dirname "$0")")"
source ./scripts/setup-environment.sh

scripts/run-dependencies.sh
yarn install
docker exec graphqlservice_postgrestest_1 psql -c "select 1" --user postgres > /dev/null 2>&1 && yarn test
scripts/stop-dependencies.sh
