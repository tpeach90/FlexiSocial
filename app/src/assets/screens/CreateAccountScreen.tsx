

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/paramLists";
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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



type CreateAccountScreenProps = NativeStackScreenProps<AuthStackParamList, "CreateAccountScreen">;

export const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({ navigation, route }) => {

    const emailRef = useRef<TextInput>(null);
    // const confirmEmailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    const [emailValid, setEmailValid] = useState(true);
    // const [confirmEmailValid, setConfirmEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const [comfirmPasswordValid, setConfirmPasswordValid] = useState(true);

    const [email, setEmail] = useState<string>("");
    // const [confirmEmail, setConfirmEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");


    const [over18Checkbox, setOver18Checkbox] = useState(false);
    const [tsAndCsCheckbox, setTsAndCsCheckbox] = useState(false);




    return (
        <>
            <StatusBar
                // make the status bar transparent on android
                backgroundColor={"#00000000" /*transparent*/}
                translucent={true}
            />
            <SafeAreaView
                edges={["top"]}
                style={{backgroundColor: colors.primary}}
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
                        <Text style={styles.headerText}>{"Create account"}</Text>
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

                        <Text style={styles.p}>You will use your email address and password to sign in.</Text>


                        <EntryBox
                            title="Email address"
                            valid={emailValid}
                            message="Not a valid email address"
                            style={styles.entryBox}
                            ref={emailRef}
                            textInputProps={{
                                onSubmitEditing: () => {
                                    passwordRef.current?.focus();
                                },
                                onChangeText(text) {
                                    setEmail(text);
                                    if (text == "")
                                        setEmailValid(true);
                                    else
                                        setEmailValid(EmailValidator.validate(text));

                                },
                                blurOnSubmit: false,
                                returnKeyType: "next",
                                spellCheck: false
                            }}
                        />

                        {/* <EntryBox
                            title="Re-enter email address"
                            valid={confirmEmailValid}
                            message="Email addresses do not match"
                            style={styles.entryBox}
                            ref={confirmEmailRef}
                            textInputProps={{
                                onSubmitEditing: () => passwordRef.current?.focus(),
                                onChangeText: (text) => {
                                    setConfirmEmail(text);
                                    if (text == "")
                                        setConfirmEmailValid(true);
                                    else
                                        setConfirmEmailValid(text === email);

                                },
                                blurOnSubmit: false,
                                returnKeyType: "next"
                            }}
                        /> */}

                        <EntryBox
                            title="Password"
                            valid={true}
                            message="you're bad."
                            style={styles.entryBox}
                            ref={passwordRef}
                            textInputProps={{
                                onSubmitEditing: () => confirmPasswordRef.current?.focus(),
                                onChangeText: (text) => {
                                    setPassword(text);
                                },
                                blurOnSubmit: false,
                                secureTextEntry: true,
                                returnKeyType: "next"
                            }}
                        />

                        <EntryBox
                            title="Re-enter password"
                            valid={comfirmPasswordValid}
                            message="Passwords do not match"
                            style={styles.entryBox}
                            ref={confirmPasswordRef}
                            textInputProps={{
                                blurOnSubmit: true,
                                secureTextEntry: true,
                                returnKeyType: "default",
                                onChangeText: (text) => {
                                    setConfirmPassword(text);
                                    if (text == "")
                                        setConfirmPasswordValid(true)
                                    else
                                        setConfirmPasswordValid(text === password)
                                }
                            }}
                        />

                        {/* spacer */}
                        <View style={{marginTop:10}} />


                        <View style={styles.checkboxRow}>
                            <CheckBox
                                style={styles.checkbox}
                                disabled={false}
                                value={over18Checkbox}
                                onValueChange={(newValue) => setOver18Checkbox(newValue)}
                                tintColors={{ true: colors.primary }}
                            />
                            <Text style={styles.checkBoxText}>I confirm that I am at least 18 (eighteen) years of age</Text>
                        </View>

                        <View style={styles.checkboxRow}>
                            <CheckBox
                                style={styles.checkbox}
                                disabled={false}
                                value={tsAndCsCheckbox}
                                onValueChange={(newValue) => setTsAndCsCheckbox(newValue)}
                                tintColors={{ true: colors.primary }}
                                
                            />
                            <Text style={styles.checkBoxText}>
                                <Text>I confirm that I have read and agreed to our </Text>
                                <Text style={{color: colors.primary}} onPress={() => console.log("go to terms and conditions")}>Terms and Conditions </Text>
                                <Text>and </Text>
                                <Text style={{ color: colors.primary }} onPress={() => console.log("go to privacy policy")}>Privacy Policy</Text>
                            </Text>

                        </View>

                        {/* Sign in button */}
                        <TouchableOpacity
                            onPress={() => console.log("create account")}
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
                                    <Text style={[styles.buttonFont, { fontSize: 20 }]}>Create account</Text>
                                </View>
                            </Shadow>
                        </TouchableOpacity>



                    </ScrollView>
                </KeyboardAvoidingView>
                
            </SafeAreaView>


        </>



    )



}

const styles = StyleSheet.create({
 
    header: {
        backgroundColor: colors.primary,
        width:"100%",
        // height:75,
        minHeight:75,
        alignItems:"center",
        justifyContent: "space-between",
        flexDirection:"row"
    },

    // on either side of the text. The icon is in the left one of these.
    headerHorizontalSpace: {
        width:55
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
        padding:25
    },
    p: {
        ...universalStyles.p,
    },
    fieldTitle: {
        ...universalStyles.h2,
        color:colors.gray,
        marginTop:20,
        marginBottom:5,
        flexShrink:1
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
        flexDirection:"row",
        alignItems:"center",
        // justifyContent: "center"
        // backgroundColor:colors.secondary,
        marginTop:20
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
        marginTop:10
    }

})