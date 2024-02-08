import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors, fonts, universalStyles } from "../../config/config"
import ChatMessage from "./ChatMessage"
import LargeButton from "./LargeButton"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { faMessage } from "@fortawesome/free-solid-svg-icons"
import { useLazyQuery, useQuery } from "@apollo/client"
import { GET_CHAT } from "../../graphql/queries"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "../../navigation/paramLists"

interface EventChatProps {
    eventId?: number
}

export default function EventChatShort(props: EventChatProps) {

    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

    const { loading: chatLoading, error: chatError, data: chatData } = useQuery(GET_CHAT, {
        variables: {
            id: props.eventId,
            maxChatMessages: 3
        },
        skip: !props.eventId,
        // fetchPolicy: "no-cache"
    });


    function seeFullConversation() {
        console.log("See full conversation")
    }

    if (chatLoading) {
        return <Text>Loading</Text>
    }
    else if (chatError) {
        return <Text>An error occurred. Please try again later.</Text>
    } 
    else if (chatData) {
        return (
            <View style={styles.container}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.heading}>Talk to others about this event</Text>
                    <TouchableOpacity style={styles.messageCounter} onPress={seeFullConversation}>
                        <FontAwesomeIcon icon={faMessage} style={styles.messageIcon} size={14} />
                        <Text style={styles.messageCounterCount}>{chatData.event.chat.count}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.subheading}>{chatData.event.chat.count > 0 ? "Most recent messages" : "Be the first to comment"}</Text>

                {Array.from(chatData.event.chat.messageQuery.messages).map((message: any, i) => 
                    <ChatMessage
                        image={require("../../assets/images/defaultPfp.png")}
                        userDisplayName={message.author.displayName}
                        content={message.content}
                        eventRole={message.author.roleInEvent}
                        onPressUser={() => navigation.navigate("UserScreen", { id: message.author.id })}
                        replyeeDisplayName={message.reply?.author.displayName}
                        onPressReplyee={() => console.log(`Focus chat message ${message.reply?.id}`)}
                        profilePicture={message.author.profilePicture}
                        key={i}
                    />
                )}

                {/* perhaps need to consider doing something different when there are few enough messages to fit on the screen without going into the separate chat view. TODO. */}
                <LargeButton text="See full conversation" onPress={seeFullConversation} style={{ alignSelf: "center", marginTop: 10 }} />

            </View>
        )
    }
    else {
        return <Text>An error occurred. Please try again later.</Text>
    } 
    // return (
    //     <View style={styles.container}>
    //         <View style={{flexDirection:"row", alignItems:"center"}}>
    //             <Text style={styles.heading}>Talk to others about this event</Text>
    //             <TouchableOpacity style={styles.messageCounter} onPress={seeFullConversation}>
    //                 <FontAwesomeIcon icon={faMessage} style={styles.messageIcon} size={14}/>
    //                 <Text style={styles.messageCounterCount} >15</Text>
    //             </TouchableOpacity>
    //         </View>
    //         <Text style={styles.subheading}>Most recent messages</Text>

    //         <ChatMessage 
    //             image={require("../../assets/images/defaultPfp.png")} 
    //             userDisplayName={"John Doe"} 
    //             content={"Hi, I just have a question, quisque vulputate, libero in conguee cursus, felis mi dapibus sem, sed tincidunt nibh tellus nec ex? The fioweojf fweo f oiko row c."} 
    //             eventRole={"interested"} 
    //             onPressUser={() => console.log("John Doe pressed.")}
    //         />

    //         <ChatMessage
    //             image={require("../../assets/images/defaultPfp.png")}
    //             userDisplayName={"John Doe"}
    //             content={"Hi, I just have a question, quisque vulputate, libero in conguee cursus, felis mi dapibus sem, sed tincidunt nibh tellus nec ex? The fioweojf fweo f oiko row c."}
    //             eventRole={"organizer"}
    //             onPressUser={() => console.log("John Doe pressed.")}
    //             replyeeDisplayName="John Doe"
    //             onPressReplyee={() => console.log("Replyee pressed.")}
    //         />

    //         {/* perhaps need to consider doing something different when there are few enough messages to fit on the screen without going into the separate chat view. TODO. */}
    //         <LargeButton text="See full conversation" onPress={seeFullConversation} style={{alignSelf:"center", marginTop:10}}/>

    //     </View>
    // )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        width:"100%",
        padding: 10
    },
    heading: {
        ...universalStyles.h1,
        // fontSize:16
    },
    subheading: {
        ...universalStyles.h2,
        color:colors.gray
    },
    messageCounter: { 
        backgroundColor: colors.primary, 
        paddingVertical: 5, 
        paddingHorizontal: 7, 
        flexDirection: "row", 
        alignItems: "center", 
        borderRadius: 10, 
        marginLeft: 10 
    },
    messageIcon: {
        color: colors.white
    },
    messageCounterCount: {
        color: colors.white,
        marginLeft: 5,
        fontFamily: fonts.primary.bold
    }
})