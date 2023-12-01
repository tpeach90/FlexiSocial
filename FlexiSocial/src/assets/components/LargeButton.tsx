import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native"
import { colors, universalStyles } from "../../config/config"

interface LargeButtonProps {
    onPress?: () => any,
    text: string,
    style?:ViewStyle
}

export default function LargeButton(props: LargeButtonProps) {

    return (
        <TouchableOpacity style={[styles.button, props.style]} onPress={() => props.onPress?.()}>
            <Text style={styles.buttonText}>{props.text}</Text>
        </TouchableOpacity> 
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        minWidth: 250,
        width: "0%", // shrink as small as possible, obeying the minWidth constraint.
        padding: 5,
        borderRadius: 15,
        marginVertical: 5

    },
    buttonText: {
        ...universalStyles.h2,
        color: colors.white,
        textAlign: "center"
    }
})