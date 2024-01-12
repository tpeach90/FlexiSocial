import { StyleSheet, Text, View } from "react-native";
import IconButton from "./IconButton";
import { faEllipsisVertical, faXmark } from "@fortawesome/free-solid-svg-icons";
import { universalStyles } from "../../config/config";


interface EventInfoHeaderProps {
    title: string,
    eventOptionsPressed?: () => any,
    closeEventPressed?: () => any,
}

export default function EventInfoHeader(props: EventInfoHeaderProps) {

    return (
        <View style={styles.headingBar}>
            <Text style={styles.h1}>{props.title}</Text>
            <View style={styles.iconButtonsContainer} >
                <IconButton
                    icon={faEllipsisVertical}
                    onPress={props.eventOptionsPressed}
                />
                <IconButton
                    icon={faXmark}
                    onPress={props.closeEventPressed}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    headingBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 7,

    },
    h1: {
        ...universalStyles.h1,
    },
    iconButtonsContainer: {
        justifyContent: "flex-end",
        flexDirection: "row",
    },
});