# Mystery Box Challenge (MBC App) :cookie:

## Endpoint

The deployable endpoint for inference using [YOLOv5](https://github.com/ultralytics/yolov5) model.

The inference endpoint is deployed using [TorchServe](https://pytorch.org/serve/), since it uses native C++ bindings of Pytorch, making the inferences for large scale models faster.

The model currently detects only top 10 of various ingredients, which are frequently used in Indian dishes. (Extension of which would require more manual labour, and a few hours of painful annotation.)

#### Deploying the Endpoint Locally

The endpoint can be locally deployed with the following commands, after cloining the repository:

```console
foo@bar:❯ pip install -r requirements.txt
foo@bar:❯ chmod 750 scripts/*
foo@bar:❯ ./scripts/deploy-endpoint.sh
```

And the server is ready to make inferences!! Try out with a sample image(hopefully with one of the objects the model is trained to detect) with the following command:

```console
foo@bar:❯ curl -X POST http://127.0.0.1:8080/predictions/yolov5m -T <image-path>
```

The server could be stopped using the following command:

```console
foo@bar:❯ ./scripts/reset-endpoint.sh
```

#### TODO

-   [x] Try native deployment using Onnxjs or Tensorflowjs.
-   [ ] Dockerize entire project for quicker deployment.

## Frontend

The native application for the Mystery Box Challenge application built using react native.

The app currently is a work in progress, but can be run using following commands:

```console
foo@bar:~$❯ expo install
foo@bar:~$❯ expo run
```

```
Note: Not optimized for iOS.
```

Or you can download the android build directly from `builds/` directory.

```
 Note: For the native app to work it is expected that the supporting repository for the inference endpoint has been cloned and the endpoint has been deployed, link to which can be found down below.
```

#### TODO

-   [x] Fetch predictions for live object detection of food ingredients.

-   [x] Implement bouding boxes from endpoint response.

-   [x] Implement hashtable for ingredients to dish search.

-   [x] Make beautiful. :)

## Linked Repositories

-   [YOLOv5 training](https://github.com/himanshu-dutta/mb-object-detection-yolov5)
