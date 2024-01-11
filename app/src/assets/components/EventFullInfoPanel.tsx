import { BackHandler, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native"
import { useDispatch } from "react-redux";
import { setEventInfoPanelStatus } from "../../redux/actions";
import EventInfo from "./EventInfo";
import EventChatShort from "./EventChatShort";
import { useQuery } from "@apollo/client";
import { GET_EVENT } from "../../graphql/queries";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/paramLists";
import { useEffect } from "react";
import { colors } from "../../config/config";


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

    // // handle back button presses.
    // useEffect(() => {
    //     const backAction = () => {
    //         dispatch(setEventInfoPanelStatus({ active: false }))
    //         return true;
    //     };

    //     const backHandler = BackHandler.addEventListener(
    //         'hardwareBackPress',
    //         backAction,
    //     );

    //     return () => backHandler.remove();
    // }, []);


    function navigateToUser(userId: number) {
        navigation.navigate("UserScreen", {id: userId});
    }

    if (eventError) console.error(eventError);

    return (
        <>

            <StatusBar
                // make the status bar transparent on android
                backgroundColor={colors.primary}
                translucent={true}
                barStyle={"light-content"}
                animated={true}
            />

            <ScrollView
                style={[styles.scrollView, { overflow: "visible", }]}
                contentContainerStyle={[styles.panelContainer, styles.background]}
                bounces={false}
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
                                onCloseEvent={() => dispatch(setEventInfoPanelStatus({ active: false }))}
                                onImGoingPressed={() => console.log("I'm going")}
                                onImInterestedPressed={() => console.log("I'm interested")}
                            />

                    }
                    <EventChatShort
                        eventId={props.eventId}
                    />
                </View>

            </ScrollView>
        </>
        
    )
}

const styles = StyleSheet.create({
    background: {
        // ...StyleSheet.absoluteFillObject,
        flexGrow: 1,
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

        
        // paddingVertical: 10
    },
    eventInfo: {
        padding: 10
    },
    panelContent: {
        padding: 10
    },
    panelContainer: {
        overflow:"visible",
        borderRadius:40,
        margin:10,
        // marginBottom:20,
        flexGrow:1
    }
})