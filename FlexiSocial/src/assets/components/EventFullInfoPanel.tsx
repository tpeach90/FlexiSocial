import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import TagButton from "./TagButton"
import { useDispatch, useSelector } from "react-redux";
import { setMapScreenToggle } from "../../redux/actions";
import { colors, universalStyles } from "../../config/config";
import { State } from "../../redux/state";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendarDays, faCheck, faClock, faEllipsisVertical, faLocationDot, faPen, faPerson, faQuestion, faXmark } from "@fortawesome/free-solid-svg-icons";
import EventInfo from "./EventInfo";
import EventChatShort from "./EventChatShort";


interface EventFullInfoPanelProps {

}

/**
 * @param props 
 * @returns 
 * @todo Goes off the bottom of the screen slightly when there is enough content for the scroll bar to be in use
 */
export default function EventFullInfoPanel(props: EventFullInfoPanelProps) {


    return (
        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.panelContainer}
        >
            <View style={styles.background} />
            <View style={styles.panelContent} >
                <EventInfo style={{padding:10}}/>
                <EventChatShort/>
                {/* <EventInfo />
                <EventInfo /> */}
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.white,
        opacity:0.75

    },
    scrollView: {

    },
    panelContent: {
        padding: 10
    },
    panelContainer: {
        overflow:"hidden",
        borderRadius:40,
        margin:10,
        // marginBottom:20,
        flexGrow:1
    }
})