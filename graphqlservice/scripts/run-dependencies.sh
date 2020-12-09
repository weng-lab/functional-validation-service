#!/bin/bash
set -e

# cd to project root directory
cd "$(dirname "$(dirname "$0")")"

source ./scripts/setup-environment.sh

# Build the importer executable
echo "Building importer..."
../importer/scripts/build.sh

# Run Postgres
echo "Running docker-compose dependencies..."
docker-compose -f docker-compose.deps.yml up -d

until docker exec graphqlservice_postgrestest_1 psql -c "select 1" --user postgres > /dev/null 2>&1; do
    sleep 2;
done

# Run Importer
echo "Running importer..."
chmod 755 ../importer/build/functional-validation-importer-*.jar
java -jar ../importer/build/functional-validation-importer-*.jar \
    --db-url jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB \
    --db-username $POSTGRES_USER \
    --db-schema $POSTGRES_SCHEMA \
    --replace-schema \
    --vista-paths test-resources/vista.GRCh38.subset.tsv.gz --vista-paths test-resources/vista.mm10.subset.tsv.gz \
    --vista-path-assemblies hg38 --vista-path-assemblies mm10

echo "Dependencies started successfully!"
