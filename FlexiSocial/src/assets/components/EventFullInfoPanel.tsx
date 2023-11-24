import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import TagButton from "./TagButton"
import { useDispatch, useSelector } from "react-redux";
import { setMapScreenToggle } from "../../redux/actions";
import { colors, universalStyles } from "../../config/config";
import { State } from "../../redux/state";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendarDays, faCheck, faClock, faEllipsisVertical, faLocationDot, faPen, faPerson, faQuestion, faXmark } from "@fortawesome/free-solid-svg-icons";
import EventInfo from "./EventInfo";


interface EventFullInfoPanelProps {

}

/**
 * Outputs the main part of the event into including name, description, statistics, images.
 * Does not include event messages/comments panel.
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
                <EventInfo />
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
        padding: 20
    },
    panelContainer: {
        overflow:"hidden",
        borderRadius:40,
        margin:10,
        // marginBottom:20,
        flexGrow:1
    }
})