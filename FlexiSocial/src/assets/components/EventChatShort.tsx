import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors, fonts, universalStyles } from "../../config/config"
import ChatMessage from "./ChatMessage"
import LargeButton from "./LargeButton"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { faMessage } from "@fortawesome/free-solid-svg-icons"

interface EventChatProps {

}

export default function EventChatShort(props: EventChatProps) {

    function seeFullConversation() {
        console.log("See full conversation")
    }

    return (
        <View style={styles.container}>
            <View style={{flexDirection:"row", alignItems:"center"}}>
                <Text style={styles.heading}>Talk to others about this event</Text>
                <TouchableOpacity style={styles.messageCounter} onPress={seeFullConversation}>
                    <FontAwesomeIcon icon={faMessage} style={styles.messageIcon} size={14}/>
                    <Text style={styles.messageCounterCount} >15</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.subheading}>Most recent messages</Text>

            <ChatMessage 
                image={require("../../assets/images/defaultPfp.png")} 
                userDisplayName={"John Doe"} 
                content={"Hi, I just have a question, quisque vulputate, libero in conguee cursus, felis mi dapibus sem, sed tincidunt nibh tellus nec ex? The fioweojf fweo f oiko row c."} 
                eventRole={"interested"} 
                onPressUser={() => console.log("John Doe pressed.")}
            />

            <ChatMessage
                image={require("../../assets/images/defaultPfp.png")}
                userDisplayName={"John Doe"}
                content={"Hi, I just have a question, quisque vulputate, libero in conguee cursus, felis mi dapibus sem, sed tincidunt nibh tellus nec ex? The fioweojf fweo f oiko row c."}
                eventRole={"organizer"}
                onPressUser={() => console.log("John Doe pressed.")}
                replyeeDisplayName="John Doe"
                onPressReplyee={() => console.log("Replyee pressed.")}
            />

            {/* perhaps need to consider doing something different when there are few enough messages to fit on the screen without going into the separate chat view. TODO. */}
            <LargeButton text="See full conversation" onPress={seeFullConversation} style={{alignSelf:"center", marginTop:10}}/>

        </View>
    )
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