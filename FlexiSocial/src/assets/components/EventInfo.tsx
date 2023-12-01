import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import TagButton from "./TagButton"
import { useDispatch, useSelector } from "react-redux";
import { setMapScreenToggle } from "../../redux/actions";
import { colors, universalStyles } from "../../config/config";
import { State } from "../../redux/state";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendarDays, faCheck, faClock, faEllipsisVertical, faLocationDot, faPen, faPerson, faQuestion, faXmark } from "@fortawesome/free-solid-svg-icons";
import LargeButton from "./LargeButton";


interface EventInfoProps {
    style?:ViewStyle
}


/**
 * Outputs the main part of the event into including name, description, statistics, images.
 * Does not include event messages/comments panel.
 * @param props 
 * @returns 
 */
export default function EventInfo(props: EventInfoProps) {

    function imGoingPressed() {
        console.log("I'm going")
    }
    function imInterestedPressed() {
        console.log("I'm interested")
    }
    function eventOptionsPressed() {
        console.log("Event options")
    }
    function closeEventPressed() {
        console.log("Close Event")
    }
    function navigateToEventOrganizer() {
        console.log("Navigate to event organizer")
    }

    return (
        <View style={props.style}>
            <View style={styles.headingBar}>
                <Text style={styles.h1}>Bowling at Alley Catz!</Text>
                <View style={styles.iconButtonsContainer} >
                    <TouchableOpacity style={styles.iconButton} onPress={eventOptionsPressed}>
                        <FontAwesomeIcon icon={faEllipsisVertical} style={styles.iconButtonIcon}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={closeEventPressed}>
                        <FontAwesomeIcon icon={faXmark} style={styles.iconButtonIcon} />
                    </TouchableOpacity>
                </View>
      
            </View>

            <View style={styles.statsItemRow} >
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faLocationDot} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"Alley Catz, Spalding"}</Text>
                </View>
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faCalendarDays} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"Friday 8th December"} </Text>
                </View>
            </View>
            <View style={styles.statsItemRow} >
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faPerson} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"for 10 people"} </Text>
                </View>
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faClock} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"Starting at 19:00, 2 hours"} </Text>
                </View>
            </View>

            <Text style={styles.p} >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed nulla tincidunt, cursus nunc id, dapibus erat. Cras mi enim, porttitor ac velit sit amet, ornare semper leo.</Text>
            
            {/* image here */}

            <Text style={styles.p} >Suspendisse efficitur suscipit nibh. Pellentesque interdum iaculis laoreet. Ut lacus nulla, finibus eget nulla id, suscipit lobortis eros. Quisque ante purus, imperdiet nec massa a, ultricies accumsan mauris.</Text>

            <View style={styles.statsItemRow} >
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faCheck} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"6 people going"}</Text>
                </View>
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faQuestion} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"2 people interested"} </Text>
                </View>         
            </View>
            <View style={styles.statsItemRow} >
       
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faPen} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>
                        {"Organized by "} 
                        <Text style={[styles.statsIconText, styles.linkColor]} onPress={navigateToEventOrganizer}>John Doe</Text>
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
    iconButton: {
        backgroundColor:colors.primary,
        aspectRatio:1,
        borderRadius:100,
        alignItems:"center",
        justifyContent: "center",
        marginHorizontal:3
    },
    iconButtonIcon: {
        color:colors.white,
        marginHorizontal:12
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