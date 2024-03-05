import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native"
import { colors, universalStyles } from "../../config/config"

interface LargeButtonProps {
    onPress?: () => any,
    text: string,
    style?:ViewStyle,
    active?: boolean
}

export default function LargeButton(props: LargeButtonProps) {

    props = {
        active:true,
        ...props
    }

    return (
        <TouchableOpacity 
            style={[
                styles.button,
                props.active? styles.enabled : styles.disabled,
                props.style
            ]}
            onPress={() => props.onPress?.()}
            disabled={!props.active}
        >
            <Text style={styles.buttonText}>{props.text}</Text>
        </TouchableOpacity> 
    )
}

const styles = StyleSheet.create({
    button: {
        minWidth: 250,
        width: "0%", // shrink as small as possible, obeying the minWidth constraint.
        padding: 5,
        borderRadius: 15,
        marginVertical: 5

    },
    enabled: {
        backgroundColor: colors.primary,
    },
    disabled: {
        backgroundColor:colors.gray
    },
    buttonText: {
        ...universalStyles.h2,
        color: colors.white,
        textAlign: "center"
    }
})