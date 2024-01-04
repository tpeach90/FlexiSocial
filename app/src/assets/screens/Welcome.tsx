import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/paramLists";
import { Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { colors, fonts } from "../../config/config";
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";



type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export const Welcome: React.FC<WelcomeScreenProps> = (props) => {


    // const dispatch = useDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();


    function signInPressed() {
        navigation.navigate("LoginScreen")
    }

    function createAccountPressed() {
        navigation.navigate("CreateAccountScreen")
    }



    return (<>
        <StatusBar
            // make the status bar transparent on android
            backgroundColor={"#00000000" /*transparent*/}
            translucent={true}
        />

        {/* background color of top bar/notch */}
        <SafeAreaView 
            style={styles.topSafeArea}
            edges={["top"]}
        />

        <SafeAreaView 
            style={styles.screen}
            edges={["left", "right", "bottom"]}    
        >

            <View style={styles.headerContainer} >
                <View style={styles.header}>

                    {/* TODO replace with image. */}
                    <View style={styles.logoPlaceholder}>
                        <Text style={{ color: "white" }}>Logo Placeholder</Text>
                    </View>

                </View>
                <Text style={[styles.h1, { marginTop: 5 }]} >Participate in free local events</Text>
            </View>

            <View style={styles.body}>

                <Text style={[styles.h1, { marginTop: 20, marginBottom: 5 }]}>See what's happening</Text>

                {/* Sign in button */}
                <TouchableOpacity
                    onPress={signInPressed}
                    style={[styles.buttonContainer]}
                >
                    <Shadow
                        style={[{ width: "100%" }]}
                        offset={[0, 2.5]}
                        distance={3}
                        startColor={"#AAA"}
                        endColor={colors.white}
                    >
                        <View style={styles.signInButton}>
                            <Text style={[styles.buttonFont, { fontSize: 20 }]}>Sign in</Text>
                        </View>
                    </Shadow>
                </TouchableOpacity>

                {/* Create an account button */}
                <TouchableOpacity
                    onPress={createAccountPressed}
                    style={styles.buttonContainer}
                >
                    <Shadow
                        style={[{ width: "100%" }]}
                        offset={[0, 2.5]}
                        distance={3}
                        startColor={"#AAA"}
                        endColor={colors.white}
                    >
                        <View style={styles.createAccountButton}>
                            <Text style={[styles.buttonFont, { fontSize: 11 }]}>Create an account</Text>
                        </View>
                    </Shadow>
                </TouchableOpacity>


                <Image
                    source={require("../images/people_walking.jpeg")}
                    style={styles.walkingImage}
                />


            </View>  
        </SafeAreaView>
    </>)
    
}

const styles = StyleSheet.create({
    screen: {
        flexDirection: "column",
        width: "100%",
        height: "100%",
        flex: 1
    },
    topSafeArea: {
        backgroundColor: colors.primary
    },
    header: {
        backgroundColor: colors.primary,
        width: "100%",
        flexGrow:1,
        alignItems: "center", // horizontal
        justifyContent: "center" //vertical

    },
    headerContainer : {
        flex: 1,
        alignItems: "center",
        backgroundColor: colors.background

    },
    body: {
        backgroundColor: colors.background,
        flex: 2,
        alignItems: "center",
    },
    h1: {
        fontSize: 14,
        fontFamily:fonts.tertiary.regular,
        color: colors.black
    },

    shadow : {
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0,
        shadowRadius: 6.27,

        elevation: 10,
    },
    buttonContainer: {
        marginVertical: 10,
        width: "80%"
    },

    signInButton: {
        // width: "80%",
        backgroundColor: colors.secondary,
        paddingVertical:10,
    },
    createAccountButton: {
        backgroundColor: colors.gray,
        paddingVertical: 10,


    },
    buttonFont: {
        alignSelf:"center",
        fontFamily: fonts.secondary.regular,
        color: colors.black
    },

    logoPlaceholder: {
        width: 200,
        height: 150,
        backgroundColor: "#F00"
    },

    walkingImage: {
        resizeMode: 'contain',
        flex: 1,
        width: "70%"
    }
})