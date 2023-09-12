#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

trap - INT TERM

# $1 - Path of the directory to package
# $2 - Original directory name
# $3 - Hash from the directory name
package() {
    local path=$1
    local directory_name=$2
    local hash=$3

    local local_url=http://localhost:3000/videos/${directory_name}
    local remote_url=${AWS_IVA_CONTENT_URL}/${hash}

    # Make directories and move isd and video files into separate directories
    echo "Packaging..."
    local tmp_dir=$(mktemp -d)
    cp -R $path $tmp_dir/$hash
    local cwd=$PWD
    pushd $tmp_dir/$hash > /dev/null

    # Replace all matches for the localhost:3000 URLs with the remote ones
    if hash gsed 2>/dev/null; then
        local sed_command=gsed
    else
        local sed_command=sed
    fi
    find . -type f -exec $sed_command -i "s#${local_url}#${remote_url}#g" {} +

    # Zip it and date it
    cd ..
    local current_date=$(date +%Y%m%d)
    zip_filename=${current_date}_${directory_name}.zip
    zip -r $zip_filename * -x "*.DS_Store"

    # Move it to the original directory
    cp $zip_filename $cwd
    popd > /dev/null

    echo "📦 Packaged into: $zip_filename ($hash)"
}

main() {
    local script_name=$(basename "$0")
    if [ "$#" -ne 1 ]; then
        echo "Input error. Run it like:"
        echo "  ./$script_name <path/to/video_directory>"
        exit 1
    fi

    local path="$1"
    if [ ! -f $path/video.mp4 ]; then
        echo "  [ERROR] No video.mp4 file found at $path/"
        exit 1
    fi

    if [ ! -f $path/isd.yml ]; then
        echo "  [ERROR] No isd.yml file found at $path/"
        exit 1
    fi

    local script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
    local dir_name=$(basename "$path" | cut -d. -f1)
    dir_name="$(echo $dir_name | tr '[A-Z]' '[a-z]')"
    hash=$("$script_dir"/generate-hash-from-string.sh "$dir_name")

    package "$path" "$dir_name" "$hash"
}

main "$@"