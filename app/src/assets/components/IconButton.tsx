import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import { colors } from "../../config/config"
import { FontAwesomeIcon, FontAwesomeIconStyle } from "@fortawesome/react-native-fontawesome"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"


interface IconButtonProps {

    style?: ViewStyle | ViewStyle[],
    iconStyle?: FontAwesomeIconStyle,
    icon: IconDefinition,
    onPress?: () => void
}

export default function IconButton(props: IconButtonProps) {

    return (
        <TouchableOpacity style={[styles.iconButton, props.style]} onPress={props.onPress}>
            <FontAwesomeIcon icon={props.icon} style={[styles.iconButtonIcon, props.iconStyle]} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    iconButton: {
        backgroundColor: colors.primary,
        aspectRatio: 1,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 3,
        width:33,
        height:33
    },
    iconButtonIcon: {
        color: colors.white,
        marginHorizontal: 12
    },
})