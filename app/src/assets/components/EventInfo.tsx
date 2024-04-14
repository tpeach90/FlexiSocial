import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import TagButton from "./TagButton"
import { useDispatch, useSelector } from "react-redux";
import { setMapScreenToggle } from "../../redux/actions";
import { colors, universalStyles } from "../../config/config";
import { State } from "../../redux/state";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendarDays, faCheck, faClock, faEllipsisVertical, faLocationDot, faPen, faPerson, faQuestion, faXmark } from "@fortawesome/free-solid-svg-icons";
import LargeButton from "./LargeButton";
import IconButton from "./IconButton";
import UserTextRenderer from "../../utils/UserTextRenderer";
import { toDurationString } from "../../utils/misc";

type EventInfoContent = {
    title: string,
    location: string,
    capacity: number,
    time: Date,
    duration: number, // in seconds
    description: string,
    goingCount: number,
    interestedCount: number,
    organizerDisplayName: string
};


interface EventInfoProps {
    style?:ViewStyle
    content?:Partial<EventInfoContent>,
    onImGoingPressed:() => void,
    onImInterestedPressed: () => void,
    onCloseEvent: () => void,
    onEventOrganizerPressed: () => void,

}




/**
 * Outputs the main part of the event into including name, description, statistics, images.
 * Does not include event messages/comments panel.
 * @param props 
 * @returns 
 */
export default function EventInfo(props: EventInfoProps) {

    function imGoingPressed() {
        props.onImGoingPressed();
    }
    function imInterestedPressed() {
        props.onImInterestedPressed();
    }
    function eventOptionsPressed() {
        console.log("Event options")
    }
    function closeEventPressed() {
        props.onCloseEvent();
    }
    function navigateToEventOrganizer() {
        props.onEventOrganizerPressed();    }

    return (
        <View style={props.style}>
            <View style={styles.headingBar}>
                <Text style={styles.h1}>{props.content?.title}</Text>
                <View style={styles.iconButtonsContainer} >
                    <IconButton
                        icon={faEllipsisVertical}
                        onPress={eventOptionsPressed}
                    />
                    <IconButton
                        icon={faXmark}
                        onPress={closeEventPressed}
                    />
                </View>
      
            </View>

            <View style={styles.statsItemRow} >
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faLocationDot} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{props.content?.location}</Text>
                </View>
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faCalendarDays} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{props.content?.time?.toLocaleDateString(undefined, {month:"long", day:"numeric", weekday:"long"})} </Text>
                </View>
            </View>
            <View style={styles.statsItemRow} >
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faPerson} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"for " + props.content?.capacity + " people"} </Text>
                </View>
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faClock} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"Starting at " + props.content?.time?.toLocaleTimeString(undefined, {hour:"2-digit", minute:"2-digit"}) + ", " + toDurationString(props.content?.duration)} </Text>
                </View>
            </View>

            {/* <Text style={styles.p} >{props.content?.description}</Text> */}
            <UserTextRenderer>{props.content?.description ?? ""}</UserTextRenderer>


            <View style={styles.statsItemRow} >
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faCheck} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{props.content?.goingCount + " people going"}</Text>
                </View>
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faQuestion} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{props.content?.interestedCount + " people interested"} </Text>
                </View>         
            </View>
            <View style={styles.statsItemRow} >
       
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faPen} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>
                        {"Organized by "} 
                        <Text style={[styles.statsIconText, styles.linkColor]} onPress={navigateToEventOrganizer}>{props.content?.organizerDisplayName}</Text>
                    </Text>
                    
                </View>
            </View>
            
            <View style={styles.largeButtonsContainer} >
                <LargeButton onPress={imGoingPressed} text="I'm going!" />
                <LargeButton onPress={imInterestedPressed} text="I'm interested" />
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    headingBar: {
        flexDirection:"row",
        justifyContent:"space-between",
        paddingBottom:7,

    },
    h1: {
        ...universalStyles.h1,
    },
    iconButtonsContainer: {
        justifyContent: "flex-end",
        flexDirection: "row",
    },
    row : {
        flex:1
    },
    statsItemRow: {
        flexDirection: "row" 
    },
    statsItem: {
        flex:1,
        flexDirection:"row",
        paddingVertical:3,
    },
    statsItemIcon: {
        color:colors.primary,
        marginRight: 10,
        transform:[{translateY:4}]
    },
    statsIconText: {
        ...universalStyles.h2,
        flex:1,
        marginLeft:5
    },
    linkColor: {
        color: colors.primary
    },
    p: {
        ...universalStyles.p
    },
    largeButtonsContainer: {
        alignItems:"center"
    },
    button: {
        backgroundColor: colors.primary,
        minWidth:250,
        width:"0%", // shrink as small as possible, obeying the minWidth constraint.
        padding:5,
        borderRadius:15,
        marginVertical:5
        
    },
    buttonText: {
        ...universalStyles.h2,
        color: colors.white,
        textAlign: "center"
    }
})