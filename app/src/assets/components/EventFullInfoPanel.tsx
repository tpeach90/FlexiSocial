import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useDispatch } from "react-redux";
import { setEventInfoPanelStatus } from "../../redux/actions";
import EventInfo from "./EventInfo";
import EventChatShort from "./EventChatShort";
import { useQuery } from "@apollo/client";
import { GET_EVENT } from "../../graphql/queries";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/paramLists";


interface EventFullInfoPanelProps {
    eventId: number,
    eventName?: string // placeholder while the event info loads.
}

/**
 * @param props 
 * @returns 
 * @todo Goes off the bottom of the screen slightly when there is enough content for the scroll bar to be in use
 */
export default function EventFullInfoPanel(props: EventFullInfoPanelProps) {

    // download the event info.
    const { loading: eventLoading, error: eventError, data: eventData } = useQuery(GET_EVENT, {
        variables: {
            id : props.eventId,
        }
    });
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const dispatch = useDispatch();

    function navigateToUser(userId: number) {
        // dispatch(setUserScreenId(userId));
        navigation.navigate("UserScreen", {id: userId});
    }

    if (eventError) console.error(eventError);

    return (
        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={[styles.panelContainer, styles.background]}
        >

            {/* TODO move the header into a separate component here.
            */}

            <View style={styles.panelContent} >

                {eventLoading ? <Text>Loading</Text> :
                    eventError ? <Text>An error occurred. Please try again later.</Text> :
                        <EventInfo
                            style={styles.eventInfo}
                            content={{
                                title: eventData.event.name,
                                location: eventData.event.location,
                                capacity: eventData.event.capacity,
                                time: new Date(eventData.event.time),
                                duration: eventData.event.duration,
                                description: eventData.event.description,
                                goingCount: eventData.event.stats.goingCount,
                                interestedCount: eventData.event.stats.interestedCount,
                                organizerDisplayName: eventData.event.creator.displayName
                            }}
                            onEventOrganizerPressed={() => navigateToUser(eventData.event.creator.id)}
                            onCloseEvent={() => dispatch(setEventInfoPanelStatus({active: false}))}
                            onImGoingPressed={() => console.log("I'm going")}
                            onImInterestedPressed={() => console.log("I'm interested")}
                        />

                }
                {/* <EventInfo 
                    style={{padding:10}}
                    content={{
                        title: "Bowling at Alley Catz",
                        location: "Alley Catz, Spalding",
                        capacity: 10,
                        time: new Date(2023, 11, 8, 19),
                        duration: 2 * 60 * 60, // in seconds
                        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed nulla tincidunt, cursus nunc id, dapibus erat. Cras mi enim, porttitor ac velit sit amet, ornare semper leo.\nSuspendisse efficitur suscipit nibh. Pellentesque interdum iaculis laoreet. Ut lacus nulla, finibus eget nulla id, suscipit lobortis eros. Quisque ante purus, imperdiet nec massa a, ultricies accumsan mauris.",
                        goingCount: 6,
                        interestedCount: 2,
                        organizerDisplayName: "John Doe"
                    }}
                    onEventOrganizerPressed={() => console.log("Event organizer pressed")}
                    onCloseEvent={() => console.log("Close event")}
                    onImGoingPressed={() => console.log("I'm going")}
                    onImInterestedPressed={() => console.log("I'm interested")}
                /> */}
                <EventChatShort
                    eventId={1}
                />
                {/* <EventInfo />
                <EventInfo /> */}
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 5,
        // },
        // shadowOpacity: 0.34,
        // shadowRadius: 6.27,

        // elevation: 10,

        // backgroundColor: colors.white,
        // opacity:0.75

    },
    scrollView: {

    },
    eventInfo: {
        padding: 10
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