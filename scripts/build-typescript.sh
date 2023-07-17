#!/bin/bash
# triggered by scripts/build-${buildlang}.sh $path2 where $path2 is the directory under typescripts
set -euxo pipefail
scriptdir=$(cd $(dirname $0) && pwd)
projectname="$1"

echo "=============================="
echo "building project: typescript/$projectname"
echo "=============================="

cd "typescript/$projectname";

# Check if yarn.lock exists
if [ -f "yarn.lock" ]; then
    echo "yarn.lock file found. Running 'yarn install'..."
    yarn install --frozen-lockfile
    yarn build
    yarn test
# Check if package-lock.json exists
elif [ -f "package-lock.json" ]; then
    echo "package-lock.json file found. Running 'npm ci'..."
    npm ci
    echo "Running 'npm build'..."
    npm run build
    echo "Running 'npm test'..."
    npm test
else
    echo "No lock files found (yarn.lock or package-lock.json). Running 'yarn install'... "
    yarn install
    yarn build
    yarn test
fi

$scriptdir/synth.sh

exit 0
