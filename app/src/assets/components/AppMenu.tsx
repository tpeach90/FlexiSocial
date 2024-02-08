/**
 * Menu that you can pull from the side of the screen.
 */

import { faGear, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { TouchableOpacity } from "@gorhom/bottom-sheet"
import { ScrollView, StyleSheet, Text, Touchable, View, ViewStyle } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors, universalStyles } from "../../config/config"


interface AppMenuProps {

}

export default function AppMenu(props: AppMenuProps) {


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
                                onPress: () => console.log("My profile")
                            },
                            {
                                title: "Account settings",
                                icon: faGear,
                                onPress: () => console.log("Account settings")
                            },
                            {
                                title: "Sign out",
                                icon: faRightFromBracket,
                                onPress: () => console.log("Sign out")
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


