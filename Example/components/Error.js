import React from 'react';
import {View, Text, StyleSheet, Animated, Dimensions} from "react-native";
import Button from "react-native-button";
import {Actions} from "react-native-router-native";

var {
  width,
  height
} = Dimensions.get("window");

var styles = StyleSheet.create({
    container: {
      width, height,
        backgroundColor:"transparent",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default class extends React.Component {
    
    render(){
        return (
            <View style={styles.container}>
                <View style={{  width:150,
                                height:50,
                                justifyContent: "center",
                                alignItems: "center",
                        borderRadius:4,
                                backgroundColor:"white" }}>
                    <Text>{this.props.data}</Text>
                    <Button onPress={Actions.pop}>Close</Button>
                </View>
            </View>
        );
    }
}
