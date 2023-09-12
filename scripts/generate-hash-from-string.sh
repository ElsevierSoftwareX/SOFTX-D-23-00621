#!/bin/bash

set -e

script_name=$(basename "$0")
if [ "$#" -ne 1 ]; then
    echo "Input error. Run it like:"
    echo "  ./$script_name <string>"
    exit 1
fi

name="$1"
hash=$(crc32 <(echo "$name"))

echo "${name:0:3}${hash}"