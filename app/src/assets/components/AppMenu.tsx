/**
 * Menu that you can pull from the side of the screen.
 */

import { StyleSheet, Text, View, ViewStyle } from "react-native"
import { colors } from "../../config/config"


interface AppMenuProps {
    open: boolean,
    width: ViewStyle["width"],
}

export default function AppMenu(props: AppMenuProps) {


    return (
        <View 
            style={[styles.container, {width: props.width}]}
        >
            <Text>This is some text that is going in the menu at the side of the screen.</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        // position: "absolute",
        top: 0,
        left: 0,
        // width: 
        height: "100%",
        backgroundColor:colors.secondary
    }
})


