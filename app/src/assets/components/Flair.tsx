import { StyleSheet, Text, View, ViewStyle } from "react-native"
import { colors, fonts } from "../../config/config"

interface FlairProps {
    text: string,
    color: string,
    style?: ViewStyle
}

export default function Flair(props: FlairProps) {

    return (
        <View style={[styles.eventRole, { backgroundColor: props.color }, props.style]}>
            <Text style={styles.eventRoleText}>{props.text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    eventRoleText: {
        color: colors.black,
        fontFamily: fonts.primary.bold,
        fontSize: 12,
    },
    eventRole: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 7,
    }
})