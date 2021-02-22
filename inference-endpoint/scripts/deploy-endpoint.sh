#!/bin/bash

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )""/.." \
&& \
mkdir -p $BASEDIR"/model-store/" \
&& \
torch-model-archiver --model-name yolov5m --version 1.0 --serialized-file $BASEDIR"/assets/yolov5m.torchscript.pt" --extra-files $BASEDIR"/assets/index_to_name.json",$BASEDIR"/objectDetectionHandler.py",$BASEDIR"/utils.py",$BASEDIR"/config.py" --handler $BASEDIR"/endpointHandler.py" --export-path $BASEDIR"/model-store" -f \
&& \
torchserve --start --model-store $BASEDIR"/model-store" --models yolov5m=yolov5m.mar --ts-config $BASEDIR"/configs/config.properties"
