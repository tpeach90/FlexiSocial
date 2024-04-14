import LinearGradient from "react-native-linear-gradient"
import MapView, { Marker } from "react-native-maps"
import { Image, StyleSheet, Text, View } from "react-native"
import { colors, googleMapsStyle, universalStyles } from "../../config/config"
import { useState } from "react"
import { useQuery } from "@apollo/client"
import { GET_EVENT, GET_EVENT_CHAT_MESSAGE_COUNT_SINCE } from "../../graphql/queries"
import StatsItem from "./StatsItem"
import { faCalendar, faCalendarDays, faCheck, faClock, faEllipsisV, faMessage, faQuestion } from "@fortawesome/free-solid-svg-icons"
import { toDurationString } from "../../utils/misc"
import LargeButton from "./LargeButton"
import IconButton from "./IconButton"
import { useSelector } from "react-redux"
import { State } from "../../redux/state"


interface EventTileProps {
    style: View["props"]["style"],
    eventId: number
    canEdit?: boolean
}


/**
 * Outputs the main part of the event into including name, description, statistics, images.
 * Does not include event messages/comments panel.
 * @param props 
 * @returns 
 */
export default function EventTile(props: EventTileProps) {

    props = {
        canEdit: false,
        ...props
    }

    const [containerDims, setContainerDims] = useState<{width: number, height:number}>();
    const [detailsDims, setDetailsDims] = useState<{ width: number, height: number }>();

    const { loading: eventLoading, error: eventError, data: eventData } = useQuery(GET_EVENT, {
        variables: {
            id: props.eventId,
        }
    });

    // number of new messages for this event.
    const mostRecentChatMessageViewed = useSelector((state:State) => state.persistent.events[props.eventId]?.mostRecentChatMessageViewed)
    const { loading: newChatMessageCountLoading, error: newChatMessageCountError, data: newChatMessageCountData } = useQuery(GET_EVENT_CHAT_MESSAGE_COUNT_SINCE, {
        variables: {
            id: props.eventId,
            since: mostRecentChatMessageViewed
        },
        skip: !mostRecentChatMessageViewed,
        fetchPolicy: "no-cache"
    });

    function editEventDetails() {
        console.log("Edit event details")
    }

    function optionsPressed() {
        console.log("options pressed")
    }

    function peopleGoingPressed() {
        console.log("People going pressed")
    }

    function peopleInterestedPressed() {
        console.log("People interested pressed")
    }

    function messagesPressed() {
        console.log("Messages pressed")
    }

    function viewEventOnMap() {
        console.log("View event on map")
    }


    return (
        <View 
            style={[styles.container, props.style]}
            onLayout={(event) => setContainerDims({width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height})}
        >
            {eventData &&
                <>
                    <MapView
                        style={StyleSheet.absoluteFillObject}
                        customMapStyle={googleMapsStyle}
                        region={{
                            latitude: eventData.event.lat, longitude: eventData.event.lon, latitudeDelta:
                                0.003, longitudeDelta: 0.003
                        }}
                        mapPadding={{ left: (containerDims && detailsDims) ? detailsDims.width: 0, bottom: (containerDims && detailsDims)? containerDims.height - detailsDims.height : 0, right: 0, top: 0 }}
                    >

                        <Marker
                            coordinate={{ latitude: eventData.event.lat, longitude: eventData.event.lon }}
                            pinColor={colors.primary}
                        >
                            <Image
                                source={require("../images/marker.png")}
                                style={styles.marker}
                            />
                        </Marker>
                    </MapView>
                    
                    {/* prevent pointer events on the map. */}
                    <View style={[StyleSheet.absoluteFillObject, {backgroundColor:"#0000"}]}/>
                </>
            }

            {/* prevent pointer events on the map. */}
            <LinearGradient
                style={styles.linearGradient}
                colors={["#000B", "#000B", "#0000", "#0000"]}
                locations={[0, 0.5, 0.7, 1]}
                useAngle={true}
                angle={90} 
                angleCenter={{ x: 0.5, y: 0.5 }}
            />
            {eventData && 
                <IconButton
                    icon={faEllipsisV}
                    onPress={optionsPressed}
                    style={{ position: "absolute", top: 10, right: 10 }}
                />
            }

            <View 
                style={styles.eventDetailsContainer}
                onLayout={(event) => setDetailsDims({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
            >
                {eventLoading &&
                    <Text style={{ color: colors.white }}>Loading</Text>
                }
                {eventData && <>
                    <Text style={styles.eventTitle} numberOfLines={2}>{eventData.event.name}</Text>
                    <StatsItem
                        icon={faCalendarDays}
                        style={{marginTop:10}}
                        theme="dark"
                    >
                        <Text>{new Date(eventData?.event?.time).toLocaleDateString(undefined, {month:"long", day:"numeric", weekday:"long"})}</Text>
                    </StatsItem>
                    <StatsItem
                        icon={faClock}
                        theme="dark"
                    >
                        <Text>{"Starting at " + new Date(eventData?.event?.time).toLocaleTimeString(undefined, {hour:"2-digit", minute:"2-digit"}) + ", " + toDurationString(eventData?.event?.duration)}</Text>
                    </StatsItem>

                    {props.canEdit &&
                        <LargeButton
                            text="Edit event details"
                            style={{minWidth:0, width:"auto", paddingHorizontal:10,alignSelf:"center"}}
                            onPress={editEventDetails}
                        />
                    }
                </>}
            </View>

            <View style={styles.eventStatsContainer} >
                {eventData && <>
                    <View style={{flexDirection: "row"}}>
                        {/* n people going */}
                        <StatsItem icon={faCheck} theme={"light"} style={{ flex: 1 }}>
                            <Text style={{color:colors.primary}} onPress={peopleGoingPressed}>{eventData?.event?.stats?.goingCount} people</Text><Text> going</Text>
                        </StatsItem>
                        {/* n people interested */}
                        <StatsItem icon={faQuestion} theme={"light"} style={{flex:1}}>
                            <Text style={{ color: colors.primary }} onPress={peopleInterestedPressed}>{eventData?.event?.stats?.interestedCount} people</Text><Text> interested</Text>
                        </StatsItem>
                    </View>
                    <View style={{flexDirection: "row"}}>
                        {/* n messages */}
                        <StatsItem icon={faMessage} theme={"light"} style={{ flex: 1 }}>
                            <Text style={{color:colors.primary}} onPress={messagesPressed}>{eventData?.event?.chat?.count} messages</Text>
                            {/* (m new) */}
                            {(newChatMessageCountData?.event?.chat?.count !== undefined && newChatMessageCountData.event.chat.count > 0) &&
                                <Text style={{ color: colors.notification }} onPress={messagesPressed}>{" (" + newChatMessageCountData.event.chat.count + " new)"}</Text>
                            }
                        </StatsItem>
                    </View> 
                </>}
                <View style={{flexGrow:1, justifyContent:"center"}} >
                    <LargeButton text="View event on map" style={{alignSelf:"center"}} onPress={viewEventOnMap}/>
                </View>
            </View>






        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        // height:250,
        borderRadius:12,
        overflow:"hidden"
    },
    marker: {
        height: 50,
        width: 50,
        resizeMode: "contain",
        flex: 1
    },
    eventTitle: {
        ...universalStyles.h1,
        color:colors.white
    },
    linearGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    eventDetailsContainer: {
        width: "50%",
        padding: 10,
        // aspectRatio:1,
        minHeight:200,
    },
    eventStatsContainer: {
        backgroundColor: "#FFFD",
        width:"95%",
        minHeight:110,
        alignSelf:"center",
        borderRadius:5,
        marginBottom:10,
        padding:7
    }
})