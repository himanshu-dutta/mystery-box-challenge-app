#!/bin/bash

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )""/.."


torchserve --stop
rm -rf $BASEDIR"/logs/"
rm -r $BASEDIR"/model-store/"

# rm $BASEDIR"/test_img.jpg"
# rm $BASEDIR"/test_info.txt"