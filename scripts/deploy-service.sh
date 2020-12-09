#!/bin/bash
# Deploys to kubernetes. Takes 3 args.
# arg1: environment, ie staging. This should match up with filename prefixes for lib/${arg1}.env.sh and k8s/${arg1}.yml.
# arg2: schema to deploy the service against.
# arg3: docker image tag to deploy. This argument is optional. If omitted, you will be prompted with a list of tags in GCR to select from.
# Example usage: scripts/deploy-service.sh staging 01-22-2019 v1.0.0
set -e

# cd to project root directory
cd "$(dirname "$(dirname "$0")")"

# import common stuff
source scripts/lib/common.sh

# Exit if two args not given
if [[ -z "$2" ]]; then
    echo "At least two arguments required.";
    exit;
fi

# Run the environment shell script to set environment specific variables
source scripts/lib/${1}.env.sh

# If a tag was provided, use it. Otherwise let the user select one.
if [[ ! -z "${3}" ]]; then
    TAG=${3}
else
    TAGS=( $(gcloud container images list-tags gcr.io/devenv-215523/snps-service --limit=10 --format="get(tags)") )
    echo "Please select a docker image tag to deploy:"
    select TAG in ${TAGS[@]}
    do
        if [[ ! -z "${TAG}" ]]; then
            echo "Deploying ${TAG}..."
            break
        else
            echo "Invalid selection..."
        fi
    done
fi

# When running in ci, we will set environment variables with base64 encoded versions of service key files.
# This will log you in with the given account.
# When running locally log in manually with your own account.
if [[ "${K8S_SERVICE_KEY}" ]]; then
    echo $K8S_SERVICE_KEY | base64 --decode > ${HOME}/k8s_service_key.json
    gcloud auth activate-service-account --key-file ${HOME}/k8s_service_key.json
fi

gcloud --quiet config set project $K8S_PROJECT_ID
gcloud --quiet config set container/cluster $K8S_CLUSTER_NAME
gcloud --quiet config set compute/zone $COMPUTE_ZONE
gcloud --quiet container clusters get-credentials $K8S_CLUSTER_NAME

# Deploy the configured service / Apply any changes to the configuration.
sed -e "s/\${SERVICE_VERSION}/${TAG}/" \
    -e "s/\${DB_SCHEMA}/${2}/" \
    k8s/service-${1}.yml | \
    kubectl apply -f -
