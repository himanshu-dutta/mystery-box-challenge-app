import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { scaleBbox } from "../utils";

const BoundingBox = (props) => {
    const { bbox, imgWidth, imgHeight, cameraDims, borderColor } = props;

    const [xScaled, yScaled, wScaled, hScaled] = scaleBbox(
        bbox,
        imgWidth,
        imgHeight,
        cameraDims
    );

    return (
        <View
            style={{
                ...styles.rectangle,
                width: wScaled,
                height: hScaled,
                top: yScaled,
                left: xScaled,
                borderColor: borderColor,
            }}
        >
            {props.children && (
                <View style={{ ...styles.text, backgroundColor: borderColor }}>
                    <Text>{props.children}</Text>
                </View>
            )}
        </View>
    );
};

export default BoundingBox;

const styles = StyleSheet.create({
    rectangle: {
        position: "absolute",
        zIndex: 99,
        borderWidth: 1,
        borderColor: "salmon",
        overflow: "hidden",
    },
    text: {
        backgroundColor: "salmon",
        maxWidth: "80%",
        alignSelf: "flex-start",
    },
});
