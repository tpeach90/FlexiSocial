
import { faCalendarDays, faMessage, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View, TouchableOpacity, Text } from "react-native"
import { colors } from "../../config/config";
import { AppStackParamList } from "../../navigation/paramLists";
import IconButton from "./IconButton"


interface AppScreenIconButtonsProps {
    style?: View["props"]["style"]
}

export default function AppScreenIconButtons(props: AppScreenIconButtonsProps) {

    const hasEvents = true;
    const hasMessages = true;

    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const iconSize = 21;

    return (
        <View style={[styles.container, props.style]}>

            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("CreateEventScreen")}>
                <FontAwesomeIcon icon={faPlus} style={[styles.iconButtonIcon]} size={iconSize} />
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={() => console.log("view calendar")}>

                <View style={styles.iconButton} >
                    <FontAwesomeIcon icon={faCalendarDays} style={[styles.iconButtonIcon]} size={iconSize} />
                </View>

                {hasEvents && <View style={styles.alert}/>}

            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log("notifications")}>
                <View style={styles.iconButton} >
                    <FontAwesomeIcon icon={faMessage} style={[styles.iconButtonIcon]} size={iconSize} />
                </View>
                {hasMessages && <View style={styles.alert} />}
            </TouchableOpacity> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column"
    },

    iconButton: {
        backgroundColor: colors.primary,
        aspectRatio: 1,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        // marginHorizontal: 3,
        width: 40,
        height: 40,
        marginTop:5
    },
    iconButtonIcon: {
        color: colors.white,
        marginHorizontal: 12
    },
    alert: {
        position:"absolute",
        top:1,
        left:1,
        width:12,
        height:12,
        backgroundColor: colors.notification,
        // alignItems:"center",
        // justifyContent:"center",
        // width:10,
        // height:10,
        borderRadius:10000
    }

})