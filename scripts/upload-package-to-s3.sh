#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

trap - INT TERM

# $@ - See https://docs.aws.amazon.com/cli/latest/reference/
docker-aws() {
    # If error on Mac, add the /var/folders directory in Docker ->
    # Preferences... -> File Sharing
    docker run --rm -t $(tty &>/dev/null && echo "-i") \
        -e "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" \
        -e "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" \
        -e "AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}" \
        -v "$PWD:/project" \
        mesosphere/aws-cli "$@"
}

# $1 - Path of the package to upload
upload-package-to-s3() {
    local package_path=$1

    tmp_dir=$(mktemp -d)
    cp -R $package_path $tmp_dir
    pushd $tmp_dir > /dev/null
    unzip $(basename $package_path) -d .
    cd */.
    local hash=$(basename $PWD)
    cd ..
    docker-aws s3 cp $hash $AWS_IVA_CONTENTS_S3_PATH/$hash --recursive --exclude "*.DS_Store"
    popd > /dev/null

    echo "📦 Done! Available at $AWS_IVA_CONTENT_URL/$hash"
}

main() {
    local script_name=$(basename "$0")
    if [ "$#" -ne 1 ]; then
        echo "Input error. Run it like:"
        echo "  ./$script_name <path/to/package.zip>"
        exit 1
    fi

    local path="$1"
    local script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

    case "$path" in
    *.zip )
        upload-package-to-s3 "$path"
        ;;
    *)
        echo "Invalid file. Only *.zip is a valid one."
        exit 1
    esac
}

main "$@"