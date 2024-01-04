

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/paramLists";
import { Alert, FetchResult, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, universalStyles } from "../../config/config";
import IconButton from "../components/IconButton";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Shadow } from "react-native-shadow-2";
import { OutlinedTextField } from "rn-material-ui-textfield";
import { useRef, useState } from "react";
import CheckBox from "@react-native-community/checkbox";
import EntryBox from "../components/EntryBox";
import * as EmailValidator from 'email-validator';
import LoadingModal from "../components/LoadingModal";
import { useMutation } from "@apollo/client";
import { LOGIN, SIGN_UP } from "../../graphql/mutations";
import { useDispatch } from "react-redux";
import { Action } from "../../redux/reducer";
import { client } from "../../utils/apolloClientConfig";



type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, "LoginScreen">;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {

    const passwordRef = useRef<TextInput>(null);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [loginMutation, { }] = useMutation(LOGIN);


    const validToSubmit = email != "" && password !== "";

    async function submit() {
        if (!validToSubmit) {
            Alert.alert("Enter your email address and password to sign in.")
            return;
        }

        if (submitting) return;
        setSubmitting(true);

        loginMutation({
            variables: {
                email: email,
                password: password
            }
        })
            .then(mutationResult => {
                if (mutationResult.errors) {
                    Alert.alert(mutationResult.errors.map(e => e.message).join("\n"))
                    setSubmitting(false);
                    return;
                }
                if (mutationResult.data) {
                    // flush graphql cache
                    client.resetStore();

                    dispatch<Action>({ type: "setUserToken", payload: { value: mutationResult.data.login.token } })
                    dispatch<Action>({ type: "setScreenStack", payload: { value: "app" } })
                    // setSubmitting(false);
                    return;
                }
            })
            .catch(mutationError => {
                Alert.alert(mutationError.message);
                setSubmitting(false);
                return;
            })

    }


    return (
        <>
            {/* prevent the user doing anything if submitting. */}
            <LoadingModal visible={submitting} />

            <StatusBar
                // make the status bar transparent on android
                backgroundColor={"#00000000" /*transparent*/}
                translucent={true}
            />
            <SafeAreaView
                edges={["top"]}
                style={{ backgroundColor: colors.primary }}
            />

            <SafeAreaView
                edges={["left", "right", "bottom"]}
                style={{flex:1, flexDirection:"column"}}
            >
                {/* header */}
                <View style={styles.header}>
                    <View style={[ styles.headerHorizontalSpace, {alignItems:"flex-end"}]}>
                        <IconButton 
                            icon={faChevronLeft}
                            style={{backgroundColor:colors.white}}
                            iconStyle={{color:colors.primary}}
                            onPress={navigation.goBack}
                        />
                    </View>
                    <View style={{alignItems:"center"}}>
                        <Text style={styles.headerText}>Sign in</Text>
                    </View>
                    {/* just a placeholder so that the text is centered. */}
                    <View style={styles.headerHorizontalSpace} />
                </View>

                {/* content */}
                <KeyboardAvoidingView
                    // behavior="height"
                    style={styles.content}
                    enabled
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollView}
                    >


                        <EntryBox
                            title="Email address"
                            message="Not a valid email address"
                            style={styles.entryBox}
                            textInputProps={{
                                onSubmitEditing: () => {
                                    passwordRef.current?.focus();
                                },
                                onChangeText(text) {
                                    setEmail(text);
                                },
                                blurOnSubmit: false,
                                returnKeyType: "next",
                                spellCheck: false,
                                editable: !submitting
                            }}
                        />

                        <EntryBox
                            title="Password"
                            message="Password must be at least 8 characters"
                            style={styles.entryBox}
                            ref={passwordRef}
                            textInputProps={{
                                onChangeText: (text) => {
                                    setPassword(text);
                                },
                                secureTextEntry: true,
                                returnKeyType: "done",
                                editable: !submitting
                            }}
                        />

                        {/* Create account button */}
                        <TouchableOpacity
                            onPress={submit}
                            style={[styles.buttonContainer]}
                            disabled={submitting}
                        >
                            <Shadow
                                style={[{ width: "100%" }]}
                                offset={[0, 2.5]}
                                distance={3}
                                startColor={"#AAA"}
                                endColor={colors.white}
                            >
                                <View style={[styles.signInButton, validToSubmit ? undefined : { backgroundColor: colors.light_gray }]}>
                                    <Text style={[styles.buttonFont, { fontSize: 20 }, validToSubmit ? undefined : { color: colors.gray }]}>Sign in</Text>
                                </View>
                            </Shadow>
                        </TouchableOpacity>

                        <Text style={styles.p}>
                            <Text>{"Don't have an account? "}</Text>
                            <Text 
                                style={{ color: colors.primary, fontWeight: "bold"}}
                                onPress={() => {
                                    navigation.navigate("CreateAccountScreen");
                                }}
                            >
                                Create account
                            </Text>
                        </Text>


                    </ScrollView>
                </KeyboardAvoidingView>

             
            </SafeAreaView>
        </>
    )


}

const styles = StyleSheet.create({

    header: {
        backgroundColor: colors.primary,
        width: "100%",
        // height:75,
        minHeight: 75,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row"
    },

    // on either side of the text. The icon is in the left one of these.
    headerHorizontalSpace: {
        width: 55
    },

    headerText: {
        ...universalStyles.screenHeaderText
    },
    content: {
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: colors.white
    },
    scrollView: {
        padding: 25
    },
    p: {
        ...universalStyles.p,
    },
    fieldTitle: {
        ...universalStyles.h2,
        color: colors.gray,
        marginTop: 20,
        marginBottom: 5,
        flexShrink: 1
    },
    checkBoxText: {
        ...universalStyles.h2,
        color: colors.gray,
        // marginTop: 20,
        flexShrink: 1
    },
    textInput: {
        width: "100%",
        backgroundColor: colors.light_gray,
        paddingVertical: 5,
        paddingHorizontal: 10,
        fontFamily: "monospace",
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        // justifyContent: "center"
        // backgroundColor:colors.secondary,
        marginTop: 20
    },
    checkbox: {
        marginRight: 5,
    },
    buttonFont: {
        alignSelf: "center",
        fontFamily: fonts.secondary.regular,
        color: colors.black
    },
    signInButton: {
        // width: "80%",
        backgroundColor: colors.secondary,
        paddingVertical: 10,
    },
    buttonContainer: {
        marginVertical: 30,
        width: "100%"
    },

    entryBox: {
        marginTop: 10
    }

})