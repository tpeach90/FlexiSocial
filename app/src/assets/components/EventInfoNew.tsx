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
import { gql, useMutation, useQuery } from "@apollo/client";
import { GET_EVENT, GET_MY_INTEREST_IN_EVENT } from "../../graphql/queries";
import { useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../navigation/paramLists";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import moment from "moment";
import { SET_INTEREST } from "../../graphql/mutations";

interface EventInfoNewProps {
    style?: ViewStyle
    eventId?: number,
    // onImGoingPressed: () => void,
    // onImInterestedPressed: () => void,
    // onEventOrganizerPressed: () => void,

}

function toDurationString(seconds?: number): string | undefined {

    if (!seconds) return undefined;

    const duration = moment.duration(seconds, "seconds");

    const hours = duration.get("hours");
    const minutes = duration.get("minutes");

    const stringParts = [];

    if (hours != 0) {
        var hourString = hours + " hour";
        if (hours != 1) hourString += "s";
        stringParts.push(hourString);
    }

    if (minutes != 0) {
        var minuteString = minutes + " minute";
        if (minutes != 1) minuteString += "s";
        stringParts.push(minuteString);
    }

    return stringParts.join(", ");
}


/**
 * Outputs the main part of the event into including name, description, statistics, images.
 * Does not include event messages/comments panel.
 * @param props 
 * @returns 
 */
export default function EventInfoNew(props: EventInfoNewProps) {

    const isSignedIn = useSelector((state: State) => !!state.persistent.userToken)

    // get data.
    const { loading: eventLoading, error: eventError, data: eventData } = useQuery(GET_EVENT, {
        variables: {
            id: props.eventId,
        },
        skip: !props.eventId
    });

    // get the current user's interest in the event, if they are signed in.
    const {loading: interestLoading, error:interestError, data: interestData} = useQuery(GET_MY_INTEREST_IN_EVENT, {
        variables: {
            eventId: props.eventId
        },
        skip: !props.eventId || !isSignedIn
    })

    // mutation for the i'm going/i'm interested buttons
    const [setInterest, { loading: setInterestLoading}] = useMutation(SET_INTEREST, {
        variables: {
            eventId: props.eventId
        },
        // update client cache.
        // change the result of GET_MY_INTEREST_IN_EVENT query from above without having to re-fetch.
        update(cache, {data, errors}, {variables}) {
            if ((!errors || errors.length == 0) && variables?.interest && interestData?.me?.user?.id && data?.setInterestInEvent?.success) {
                cache.writeQuery({
                    query: GET_MY_INTEREST_IN_EVENT,
                    variables: {
                        eventId: variables.eventId
                    },
                    data: {
                        me: {
                            id: interestData.me.user.id,
                            user: {
                                id: interestData.me.user.id,
                                roleInEvent: variables.interest
                            }
                        }
                    },
                });
            }
        },
    });




    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

    function imGoingPressed() {
        const currentInterest = interestData?.me?.user?.roleInEvent;
        if (!setInterestLoading && currentInterest && currentInterest != "organizer") {
            if (currentInterest == "going") {
                setInterest({ variables: { interest: "none" } });
            } else {
                setInterest({ variables: { interest: "going" } });
            }
        }
    }
    function imInterestedPressed() {
        const currentInterest = interestData?.me?.user?.roleInEvent;
        if (!setInterestLoading && currentInterest && currentInterest != "organizer") {
            if (currentInterest == "interested") {
                setInterest({ variables: { interest: "none" } });
            } else {
                setInterest({ variables: { interest: "interested" } });
            }
        }
    }
    function navigateToEventOrganizer() {
        if (eventData?.event?.creator?.id)
            navigation.navigate("UserScreen", {id: eventData.event.creator.id})
    }
    if (!props.eventId) {
        return <Text>No event.</Text>
    } else if (eventLoading) {
        return <Text>Loading</Text>
    } else if (eventError) {
        console.log(eventError)
        return <Text>An error occurred</Text>
    } else if (!eventData) {
        return <Text>No data.</Text>
    }

    return (
        <View style={props.style}>

            <View style={styles.statsItemRow} >
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faLocationDot} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{eventData.event.location}</Text>
                </View>
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faCalendarDays} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{new Date(eventData.event.time).toLocaleDateString(undefined, { month: "long", day: "numeric", weekday: "long" })} </Text>
                </View>
            </View>
            <View style={styles.statsItemRow} >
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faPerson} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"for " + eventData.event.capacity + " people"} </Text>
                </View>
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faClock} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{"Starting at " + new Date(eventData.event.time).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) + ", " + toDurationString(eventData.event.duration)} </Text>
                </View>
            </View>

            <View style={styles.description} >
                <UserTextRenderer>{eventData.event.description ?? ""}</UserTextRenderer>
            </View>


            <View style={styles.statsItemRow} >
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faCheck} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{eventData.event.stats.goingCount + " people going"}</Text>
                </View>
                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faQuestion} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>{eventData.event.stats.interestedCount + " people interested"} </Text>
                </View>
            </View>
            <View style={styles.statsItemRow} >

                <View style={styles.statsItem}>
                    <FontAwesomeIcon icon={faPen} style={styles.statsItemIcon} />
                    <Text style={styles.statsIconText}>
                        {"Organized by "}
                        <Text style={[styles.statsIconText, styles.linkColor]} onPress={navigateToEventOrganizer}>{eventData.event.creator.displayName}</Text>
                    </Text>

                </View>
            </View>

            {interestData?.me?.user?.roleInEvent != "organizer" &&
                <View style={styles.largeButtonsContainer} >
                    {/* <Text>Current status: {interestData?.me?.user?.roleInEvent}</Text> */}
                    { 
                        [
                            {
                                onPress: imGoingPressed,
                                litUpWhen: interestData?.me?.user?.roleInEvent == "going",
                                text: "I'm going!"
                            },
                            {
                                onPress: imInterestedPressed,
                                litUpWhen: interestData?.me?.user?.roleInEvent == "interested",
                                text: "I'm interested"
                            }
                        ].map(({onPress, litUpWhen, text}, i) => 
                            <LargeButton
                                onPress={onPress}
                                // make green if selected.
                                style={litUpWhen ? {backgroundColor: colors.secondary} : {}}
                                textStyle={litUpWhen ? {color: colors.primary} : {}}
                                text={text}
                                // display icons at the right.
                                atRight={
                                    litUpWhen ?
                                        <FontAwesomeIcon icon={faCheck} color={colors.primary} /> :
                                        undefined
                                }
                                // active={!setInterestLoading}
                                key={i}
                            />
                        )
                    }
                </View>
            }
            {interestData?.me?.user?.roleInEvent == "organizer" &&
                <Text style={styles.youAreAnOrganizerText}>You are an organizer of this event.</Text>
            }

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
    row: {
        flex: 1
    },
    statsItemRow: {
        flexDirection: "row",
        paddingLeft:5,
    },
    statsItem: {
        flex: 1,
        flexDirection: "row",
        paddingVertical: 3,
    },
    statsItemIcon: {
        color: colors.primary,
        marginRight: 10,
        transform: [{ translateY: 4 }]
    },
    statsIconText: {
        ...universalStyles.h2,
        flex: 1,
        marginLeft: 5
    },
    linkColor: {
        color: colors.primary
    },
    p: {
        ...universalStyles.p
    },
    largeButtonsContainer: {
        alignItems: "center"
    },
    button: {
        backgroundColor: colors.primary,
        minWidth: 250,
        width: "0%", // shrink as small as possible, obeying the minWidth constraint.
        padding: 5,
        borderRadius: 15,
        marginVertical: 5

    },
    buttonText: {
        ...universalStyles.h2,
        color: colors.white,
        textAlign: "center"
    },
    description: {
        paddingVertical: 15
    },
    youAreAnOrganizerText: {
        ...universalStyles.h2,
        alignSelf: "center", 
        color: colors.black, 
        backgroundColor: colors.secondary,
        paddingHorizontal:10,
        borderRadius:10,
        marginTop: 10,
    }
})