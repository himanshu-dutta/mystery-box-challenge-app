import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    Button,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
} from "react-native";

// imports
import { Camera } from "expo-camera";
import { FlatGrid } from "react-native-super-grid";

// constants
import Colors from "./constants/colors";
const CONFIDENCE_THRESHOLD = 0.5;

// components
import Header from "./components/Header";
import BoundingBox from "./components/BoundingBox";

// utilities
import { chooseColor, findDish } from "./utils";
let cameraRef;
const captureaHandler = async () => {
    if (cameraRef) {
        const image = await cameraRef.takePictureAsync({
            base64: true,
            quality: 0,
        });
        return image;
    }
};

export default function App() {
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [cameraDims, setCameraDims] = useState();

    const [ingredients, setIngredients] = useState([]);
    const [dishes, setDishes] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    const [inferenceURL, setInferenceURL] = useState(
        "http://192.168.43.20:8080"
    );
    const [isInferenceURL, setIsInferenceURL] = useState(false);

    const getBoundingBoxes = async (imageBase64) => {
        const boundingBoxes = await fetch(
            inferenceURL + "/predictions/yolov5m",
            {
                method: "POST",
                body: imageBase64,
            }
        )
            .then((response) => response.json())
            .then((res) => {
                console.log("Response: ", res);

                const predictions = res["predictions"];

                const predictionsList = predictions.map((prediction) => {
                    return {
                        confidence: prediction[4].toFixed(2),
                        name: prediction[5],
                        code: chooseColor(Colors.colorOptions),
                        width: prediction[6],
                        height: prediction[7],
                        bbox: {
                            x: prediction[0],
                            y: prediction[1],
                            width: prediction[2],
                            height: prediction[3],
                        },
                    };
                });

                setIngredients(
                    predictionsList.filter(
                        (prediction) =>
                            prediction.confidence > CONFIDENCE_THRESHOLD
                    )
                );
                setDishes(
                    findDish(
                        predictionsList.filter(
                            (prediction) =>
                                prediction.confidence > CONFIDENCE_THRESHOLD
                        )
                    )
                );
            })
            .catch((error) => {
                console.log(
                    "Something went wrong while getting the bouding boxes..."
                );
                console.log(error);
                return [];
            });
        return boundingBoxes;
    };

    const imageHandler = () => {
        captureaHandler().then((image) => {
            setCapturedImage(image.uri);
            console.log("Making API call...");
            getBoundingBoxes(image.base64.trim().replace(/\s/g, "+"));
        });
    };

    const inferenceURLHandler = (alert) => {
        fetch(inferenceURL + "/ping")
            .then((res) => {
                console.log("Returned status: ", res.status);
                if (res.status === 200) {
                    if (!alert) {
                        Alert.alert(
                            `URL: ${inferenceURL}`,
                            "You can now make inferences.",
                            [
                                {
                                    text: "Ok",
                                    style: "cancel",
                                    onPress: setIsInferenceURL(true),
                                },
                            ],
                            { cancelable: true }
                        );
                    } else setIsInferenceURL(true);
                }
            })
            .catch((err) => {
                if (alert)
                    Alert.alert(
                        "Invalid Inference URL",
                        "Can't ping the inference url entered.",
                        [{ text: "Retry", style: "cancel" }]
                    );
                setIsInferenceURL(false);
            });
    };

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    useEffect(() => {
        inferenceURLHandler(false);
    }, []);

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    if (!isInferenceURL) {
        return (
            <Modal visible={true} animationType="fade">
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContainer}>
                        <Text style={{ backgroundColor: "rgb(240,240,240)" }}>
                            Please enter the inference address to ping before
                            using the app
                        </Text>

                        <TextInput
                            style={styles.input}
                            onChangeText={setInferenceURL}
                            value={inferenceURL}
                            autoFocus={true}
                        />
                        <Button
                            title="PING"
                            onPress={() => inferenceURLHandler(true)}
                            type="clear"
                        />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="MBC App" />
            <View style={styles.screen}>
                <View
                    style={styles.camera}
                    onLayout={(event) => {
                        setCameraDims(event.nativeEvent.layout);
                    }}
                >
                    {capturedImage ? (
                        <TouchableWithoutFeedback
                            onPress={() => {
                                setIngredients([]);
                                setCapturedImage(null);
                                setDishes(null);
                            }}
                        >
                            <Image
                                source={{ uri: capturedImage }}
                                style={styles.camera}
                            />
                        </TouchableWithoutFeedback>
                    ) : (
                        <Camera
                            style={styles.camera}
                            type={type}
                            ref={(r) => {
                                cameraRef = r;
                            }}
                        ></Camera>
                    )}
                    {capturedImage &&
                        cameraDims &&
                        ingredients &&
                        (function () {
                            console.log("Ingredients are...", ingredients);
                            return 1;
                        })() &&
                        ingredients.map((ingredient, idx) => {
                            console.log("Cameradims:", cameraDims);
                            console.log("Current ingredient: ", ingredient);
                            return (
                                <TouchableWithoutFeedback
                                    onPress={() => {
                                        console.log("Pressed");
                                        setCapturedImage(null);
                                    }}
                                    key={idx}
                                >
                                    <BoundingBox
                                        bbox={ingredient.bbox}
                                        imgWidth={ingredient.width}
                                        imgHeight={ingredient.height}
                                        borderColor={ingredient.code}
                                        cameraDims={cameraDims}
                                    >
                                        {ingredient.name}
                                    </BoundingBox>
                                </TouchableWithoutFeedback>
                            );
                        })}
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.4}
                        onPress={() => {
                            setType(
                                type === Camera.Constants.Type.back
                                    ? Camera.Constants.Type.front
                                    : Camera.Constants.Type.back
                            );
                        }}
                    >
                        <Text style={styles.text}> Flip </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={imageHandler}
                        activeOpacity={0.4}
                    >
                        <Text style={styles.text}> Capture </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setIsInferenceURL(false)}
                        activeOpacity={0.4}
                    >
                        <Text style={styles.text}> Reset </Text>
                    </TouchableOpacity>
                </View>
            </View>
            {ingredients && (
                <FlatGrid
                    staticDimension={80}
                    data={ingredients}
                    style={styles.predictions}
                    spacing={20}
                    itemDimension={250}
                    horizontal={true}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.itemContainer,
                                { backgroundColor: item.code },
                            ]}
                        >
                            <Text style={styles.itemName}>
                                {item.name.charAt(0).toUpperCase() +
                                    item.name.slice(1)}
                            </Text>
                            <Text style={styles.itemCode}>
                                {(item.confidence * 100).toFixed(0)}%
                            </Text>
                        </View>
                    )}
                />
            )}

            {dishes && (
                <FlatGrid
                    staticDimension={80}
                    data={dishes}
                    style={styles.predictions}
                    spacing={20}
                    itemDimension={250}
                    horizontal={true}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.itemContainer,
                                { backgroundColor: item.code },
                            ]}
                        >
                            <Text style={styles.itemName}>Jam these in...</Text>
                            <Text
                                style={{
                                    ...styles.itemCode,
                                    fontWeight: "bold",
                                }}
                            >
                                {item.name}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        width: "80%",
        borderBottomColor: "#eee",
        borderLeftColor: "white",
        borderRightColor: "white",
        borderTopColor: "white",
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        textAlign: "center",
    },

    // container
    screen: {
        flex: 6,
        maxHeight: "70%",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    predictions: {
        flex: 1,
        maxHeight: "10%",
        alignContent: "center",
        marginLeft: "2%",
    },

    // camera screen
    camera: {
        flex: 14,
        marginTop: 0,
        height: "66%",
        width: "100%",
    },
    rectangle: {
        height: 128,
        width: 128,
        position: "absolute",
        zIndex: 99,
        top: 0,
        left: 0,
        borderWidth: 1,
    },

    buttonContainer: {
        flex: 1,
        width: "90%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center",
        padding: 10,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: "rgb(250,250,250)",
        width: 95,
        height: 45,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.button,
        elevation: 4,
    },
    text: {
        fontWeight: "bold",
        color: Colors.button,
    },

    // new
    itemContainer: {
        justifyContent: "flex-end",
        borderRadius: 5,
        padding: 10,
        height: 50,
    },
    itemName: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "600",
    },
    itemCode: {
        fontWeight: "600",
        fontSize: 12,
        color: "#fff",
    },
});
