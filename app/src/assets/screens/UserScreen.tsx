import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/paramLists";
import { Image, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@apollo/client";
import { GET_USER } from "../../graphql/queries";
import { SafeAreaView } from "react-native-safe-area-context";
import IconButton from "../components/IconButton";
import { faCalendarDays, faChevronLeft, faEllipsisV, faPen } from "@fortawesome/free-solid-svg-icons";
import { colors, fonts, pfpURL, universalStyles } from "../../config/config";
import Flair from "../components/Flair";
import UserTextRenderer from "../../utils/UserTextRenderer";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import moment from "moment";
import FastImage from "react-native-fast-image";



type UserScreen = NativeStackScreenProps<AppStackParamList, "UserScreen">;

export const UserScreen: React.FC<UserScreen> = ({navigation, route}) => {

    // get user data
    const { loading: userLoading, error: userError, data: userData } = useQuery(GET_USER, {
        variables: {
            id: route.params.id,
        },
    });

    let content = (() => {
        if (userLoading) {
            return <Text>Loading</Text>
        }
        else if (userError) {
            return <Text>An error occurred. Please try again later.</Text>
        }
        else if (userData) {
            if (!userData.user) {
                <Text>User not found.</Text>
            }
            return (
                <View>
                    {
                        userData.user.profilePicture 
                            ? <FastImage
                                style={styles.pfpStyle}
                                source={{ uri: pfpURL + "/" + userData.user.profilePicture }}
                                onError={() => console.error("User pfp failed to load.")}
                            />
                            : <Image
                                source={require("../../assets/images/defaultPfp.png")}
                                style={styles.pfpStyle}
                            />
                    }
                    <Text style={styles.userNameStyle}>{userData.user.displayName}</Text>
                    {(() => {
                        switch (userData.user.role) {
                            case "standard":
                                return <Flair
                                    color={colors.gray}
                                    text="Flexisocial user"
                                    style={styles.flair}
                                /> 
                            case "moderator":
                                return <Flair
                                    color={colors.secondary}
                                    text="Flexisocial moderator"
                                    style={styles.flair}
                                />  
                            case "administrator":
                                return <Flair
                                    color={colors.tertiary}
                                    text="Flexisocial administrator"
                                    style={styles.flair}
                                />  
                        }
                    })()}

                    <View style={styles.mainContent} >

                        {userData.user.bio 
                            ? <UserTextRenderer style={styles.bio}>{userData.user.bio}</UserTextRenderer>
                            : undefined
                        }
                        
                        <View style={styles.statsItem}>
                            <FontAwesomeIcon icon={faCalendarDays} style={styles.calendarIcon} size={20} />
                            <Text style={styles.statsIconText}>Flexisocial user for {moment(new Date(userData.user.registerTimestamp)).fromNow(true)}</Text>
                        </View>

                        {/* if the user has organized any events then display how many. */}
                        {userData.user.stats.eventsOrganizedCount > 0
                            ? <View style={styles.statsItem}>
                                <FontAwesomeIcon icon={faPen} style={styles.penIcon} size={20}/>
                                <Text style={styles.statsIconText}>{"Organizer of "}</Text>
                                <Text style={styles.statsIconTextLink} onPress={() => console.log("events pressed")}>{userData.user.stats.eventsOrganizedCount} events</Text>
                            </View>
                            : undefined
                        }

                    </View>



                </View>
            )
        }
        else {
            return <Text>An error occurred. Please try again later.</Text>
        }
    })();

    
    return (
        <>
            <StatusBar
                // make the status bar transparent on android
                backgroundColor={"#0000"}
                translucent={true}
                barStyle={"dark-content"}
                animated={true}
            />
            <SafeAreaView>
                <View style={styles.header}>
                    <IconButton
                        icon={faChevronLeft}
                        onPress={navigation.goBack}
                    />
                    <IconButton
                        icon={faEllipsisV}
                        onPress={() => console.log("elipsis pressed")}
                    />
                </View>

                <ScrollView>
                    {content}
                </ScrollView>

            </SafeAreaView>
        </>

    )



}

const styles = StyleSheet.create({
    header: {
        marginTop:10,
        marginHorizontal:10,
        flexDirection:"row",
        justifyContent:"space-between",
    },
    pfpStyle: {
        width: 120,
        height: 120,
        alignSelf:"center",
        borderRadius: 60,
        overflow:"hidden"
    },
    userNameStyle: {
        ...universalStyles.h1,
        marginTop:10,
        alignSelf:"center"
    },
    flair: {
        alignSelf:"center",
        marginTop:5
    },
    mainContent: {
        marginHorizontal:20,
        marginTop:15
    },
    bio: {
        marginTop:10,
        marginBottom:15
    },
    statsItem: {
        // flex: 1,
        flexDirection: "row",
        paddingVertical: 5,
    },
    calendarIcon: {
        color: colors.primary,
        marginRight: 10,
    },
    penIcon: {
        color: colors.secondary,
        marginRight: 10,
    },
    statsIconText: {
        ...universalStyles.h2,
        marginLeft: 5,
    },
    statsIconTextLink: {
        ...universalStyles.h2,
        color: colors.primary
    }
})