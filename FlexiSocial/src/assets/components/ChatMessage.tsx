import { Image, Pressable, StyleSheet, Text, TextBase, Touchable, TouchableOpacity, View } from "react-native"
import { colors, fonts, universalStyles } from "../../config/config"
import { UserEventRole } from "../../utils/types"
import { faArrowLeft, faEllipsisVertical, faLeftLong } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"

interface ChatMessageProps {
    image?: any,
    userDisplayName: string,
    content: string,
    eventRole: UserEventRole,
    replyeeDisplayName?: string
    onPressUser?: () => any,
    onPressReplyee?: () => any

}

export default function ChatMessage(props: ChatMessageProps) {

    return (
        <View style={styles.container}>
            <Pressable onPress={() => props.onPressUser?.()}>
                <Image source={props.image} style={{width:40, height:40}}></Image>
            </Pressable>
            <View style={styles.main}>
                <View style={{justifyContent:"space-between", flexDirection:"row", flexShrink:1}}>
                    <View style={styles.userDescription}>
                        <Text style={styles.userDisplayName} onPress={() => props.onPressUser?.()}>{props.userDisplayName}</Text>
                        {(() => {
                            switch (props.eventRole) {
                                case "going":
                                    return (
                                        <View style={[styles.eventRole, { backgroundColor: colors.gray }]}>
                                            <Text style={styles.eventRoleText}>Going</Text>
                                        </View>
                                    )
                                case "interested":
                                    return (
                                        <View style={[styles.eventRole, { backgroundColor: colors.gray }]}>
                                            <Text style={styles.eventRoleText}>Interested</Text>
                                        </View>
                                    )
                                case "organizer":
                                    return (
                                        <View style={[styles.eventRole, { backgroundColor: colors.secondary }]}>
                                            <Text style={styles.eventRoleText}>Organizer</Text>
                                        </View>
                                    )
                            }
                        })()}
                    </View>
                    <TouchableOpacity onPress={() => console.log("options.")}>
                        <FontAwesomeIcon icon={faEllipsisVertical} style={styles.verticalElipsis} />
                    </TouchableOpacity>
                </View>
                
                {/* display "replying to ..." message */}
                {(() => {
                    if (props.replyeeDisplayName !== undefined) {
                        return (
                            <Pressable 
                                onPress={() => props.onPressReplyee?.()}
                                style={{flexDirection:"row", alignItems:"center", paddingVertical:3, paddingRight:5}}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} style={styles.replyeeArrowIcon} size={10}/>
                                <Text style={styles.replyingToText}>replying to </Text>
                                <Text style={styles.replyeeNameText}>{props.replyeeDisplayName}</Text>
                                <Text style={styles.replyingToText}></Text>
                            </Pressable>
                        )
                    }
                    return undefined
                })()}

                <Text style={styles.content}>{props.content}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        flexDirection: "row",
        marginTop:5
    },
    userDescription: { 
        flexDirection: "row",
        alignItems: "center",
    },
    main : {
        marginLeft: 5,
        flexShrink:1
    },
    userDisplayName: {
        color:colors.primary,
        fontFamily: fonts.primary.bold,
        fontSize:12
    },
    eventRole: {
        paddingHorizontal:6,
        paddingVertical:1,
        borderRadius:7,
        marginLeft: 5
    },
    verticalElipsis: {
        color:colors.primary
    },
    eventRoleText: {
        color:colors.black,
        fontFamily: fonts.primary.bold,
        fontSize: 12
    },
    content: {
        ...universalStyles.p,
    },
    replyingToText: {
        color: colors.gray,
        fontFamily: fonts.primary.bold,
        fontSize: 9
    },
    replyeeNameText: {
        color: colors.primary,
        fontFamily: fonts.primary.bold,
        fontSize: 9
    },
    replyeeArrowIcon: {
        color:colors.primary,
        marginRight:5
    }
})