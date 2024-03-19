/**
 * Menu that you can pull from the side of the screen.
 */

import { useLazyQuery, useQuery } from "@apollo/client"
import { faGear, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { TouchableOpacity } from "@gorhom/bottom-sheet"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useCallback } from "react"
import { Alert, ScrollView, StyleSheet, Text, Touchable, View, ViewStyle } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { useDispatch } from "react-redux"
import { colors, universalStyles } from "../../config/config"
import { GET_MY_ID } from "../../graphql/queries"
import { AppStackParamList } from "../../navigation/paramLists"
import { Action } from "../../redux/reducer"
import { client } from "../../utils/apolloClientConfig"


interface AppMenuProps {

}

export default function AppMenu(props: AppMenuProps) {

    const disaptch = useDispatch();

    const [getMyId, {}] = useLazyQuery(GET_MY_ID);
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

    const goToProfile = useCallback(async () => {

        const {data, error} = await getMyId();

        if (data) {
            if (data?.me?.user?.id) {
                navigation.navigate("UserScreen", { id: data.me.user.id })
            }
            else {
                Alert.alert("You are not signed in.")
            }
            return;
        }

        // no data??
        else if (error) {
            Alert.alert(error.message);
        } else {
            Alert.alert("An unexpected error occurred.")
        }

    }, []);


    const signOut = useCallback(() => {

        const onConfirm = () => {
            disaptch<Action>({type:"setUserToken", payload: {value: null}});
            disaptch<Action>({type: "setScreenStack", payload:{value: "auth"}})
            client.clearStore();
        }

        Alert.alert("Sign out", "Are you sure you want to sign out?", [
            { text: "Cancel" },
            { text: "Sign out", isPreferred: true, onPress: onConfirm },
        ])
    }, []);


    return (
        <View 
            style={[styles.container]}
        >   
            {/* darker at the top of the screen */}
            <LinearGradient
                style={{ height: "100%"}}
                colors={["#0004", "#0004", "#0000"]}
                locations={[0, 0.2, 1]}
            >

                <SafeAreaView>
                
                    <ScrollView>
                        {[
                            {
                                title: "My profile",
                                icon: faUser,
                                onPress: goToProfile
                            },
                            {
                                title: "Account settings",
                                icon: faGear,
                                onPress: () => console.log("Account settings")
                            },
                            {
                                title: "Sign out",
                                icon: faRightFromBracket,
                                onPress: signOut
                            }

                        ].map(({ title, icon, onPress }, i) =>
                            <TouchableOpacity
                                onPress={onPress}
                                key={i}
                            >
                                <View style={styles.button}>
                                    <FontAwesomeIcon icon={icon} style={styles.buttonIcon} size={20} />
                                    <Text style={styles.buttonText}>{title}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                </SafeAreaView>
            </LinearGradient>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        // position: "absolute",
        top: 0,
        left: 0,
        // width: 
        height: "100%",
        backgroundColor:colors.primary
    },
    button: {
        flexDirection: "row",
        paddingVertical: 20,
        paddingHorizontal:15,
        backgroundColor: colors.light_primary,
        marginTop: 10,
        marginHorizontal: 10,
        alignItems: "center"
    },
    buttonIcon: {
        color: colors.white,
        marginRight: 15
    },
    buttonText: {
        ...universalStyles.h2,
        color: colors.white,
    }
})


