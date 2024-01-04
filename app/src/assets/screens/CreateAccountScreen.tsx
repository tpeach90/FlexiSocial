

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
import { SIGN_UP } from "../../graphql/mutations";
import { useDispatch } from "react-redux";
import { Action } from "../../redux/reducer";
import { client } from "../../utils/apolloClientConfig";



type CreateAccountScreenProps = NativeStackScreenProps<AuthStackParamList, "CreateAccountScreen">;

export const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({ navigation, route }) => {

    const emailRef = useRef<TextInput>(null);
    // const confirmEmailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);
    const displayNameRef = useRef<TextInput>(null);

    const [emailValid, setEmailValid] = useState(true);
    // const [confirmEmailValid, setConfirmEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const [comfirmPasswordValid, setConfirmPasswordValid] = useState(true);

    const [email, setEmail] = useState<string>("");
    // const [confirmEmail, setConfirmEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [displayName, setDisplayName] = useState<string>("");


    const [over18Checkbox, setOver18Checkbox] = useState(false);
    const [tsAndCsCheckbox, setTsAndCsCheckbox] = useState(false);

    const [submitting, setSubmitting] = useState<boolean>(false);

    const dispatch = useDispatch();

    const [signUpMutation, {data, loading, error}] = useMutation(SIGN_UP);


    function getValidityMessages(email: string, password: string, confirmPassword: string, displayName: string, over18Checkbox: boolean, tsAndCsCheckbox: boolean) {

        let problems = [];

        if (email === "")
            problems.push("Please enter an email address.")
        else if (!EmailValidator.validate(email))
            problems.push("Please enter a valid email address.")

        if (password === "")
            problems.push("Please enter a password.")
        else if (password.length < 8)
            problems.push("Password must be at least 8 characters.")

        if (confirmPassword != password)
            problems.push("Passwords do not match.")

        if (displayName === "")
            problems.push("Please enter a display name.")

        if (!over18Checkbox)
            problems.push("You need to be at least 18 years old to use this app. Please check the box if you are 18 or older.")

        if (!tsAndCsCheckbox)
            problems.push("Please check the box to confirm that you have read and agreed to the Terms and Conditions and Privacy Policy.")

        return problems
    }

    const validToSubmit = getValidityMessages(email, password, confirmPassword, displayName, over18Checkbox, tsAndCsCheckbox).length == 0;

    async function submit() {

        // verify the stuff added.
        const problems = getValidityMessages(email, password, confirmPassword, displayName, over18Checkbox, tsAndCsCheckbox);
        if (problems.length == 1) {
            Alert.alert("Details not complete", problems[0]);
            return;
        }
        else if (problems.length > 1) {
            Alert.alert("Details not complete", problems.map(p => ` • ${p}`).join("\n"))
            return; 
        }

        // prevent this function from being called more than once.
        if (submitting) return;
        setSubmitting(true);

        // // register account.
        // let mutationResult: any;
        // try {
        //     mutationResult = await signUpMutation({
        //         variables: {
        //             email, password, displayName
        //         }
        //     })
        // }

        signUpMutation({
            variables: {
                email, password, displayName
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

                dispatch<Action>({ type: "setUserToken", payload: { value: mutationResult.data.signup.token} })
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
            <LoadingModal visible={submitting}/>

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

                        <Text style={styles.p}>
                            <Text>{"Already have an account? "}</Text>
                            <Text
                                style={{ color: colors.primary, fontWeight: "bold" }}
                                onPress={() => {
                                    navigation.navigate("LoginScreen");
                                }}
                            >
                                Sign in
                            </Text>
                        </Text>


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
                                    setEmailValid(text == "" || EmailValidator.validate(text));

                                },
                                blurOnSubmit: false,
                                returnKeyType: "next",
                                spellCheck: false,
                                editable: !submitting
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
                            valid={passwordValid}
                            message="Password must be at least 8 characters"
                            style={styles.entryBox}
                            ref={passwordRef}
                            textInputProps={{
                                onSubmitEditing: () => confirmPasswordRef.current?.focus(),
                                onChangeText: (text) => {
                                    setPassword(text);
                                    setPasswordValid(text === "" || text.length >= 8)
                                },
                                blurOnSubmit: false,
                                secureTextEntry: true,
                                returnKeyType: "next",
                                editable: !submitting
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
                                returnKeyType: "next",
                                onSubmitEditing: () => displayNameRef.current?.focus(),
                                onChangeText: (text) => {
                                    setConfirmPassword(text);
                                    setConfirmPasswordValid(text == "" || text === password)
                                },
                                editable: !submitting
                            }}
                        />

                        {/* spacer */}
                        <View style={{marginTop:10}} />
                        
                        <Text style={styles.p}>Your display name is how you will appear to others on the app. You can always change this later.</Text>
                        <EntryBox
                            title="Display name"
                            valid={true}
                            // message="Passwords do not match"
                            style={styles.entryBox}
                            ref={displayNameRef}
                            textInputProps={{
                                blurOnSubmit: true,
                                spellCheck: false,
                                returnKeyType: "default",
                                onChangeText: (text) => {
                                    setDisplayName(text);
                                },
                                editable: !submitting
                            }}
                        />

                        {/* spacer */}
                        <View style={{ marginTop: 10 }} />


                        <View style={styles.checkboxRow}>
                            <CheckBox
                                style={styles.checkbox}
                                disabled={false}
                                value={over18Checkbox}
                                onValueChange={(newValue) => setOver18Checkbox(newValue)}
                                tintColors={{ true: colors.primary }}
                            />
                            <Text style={styles.checkBoxText} onPress={() => setOver18Checkbox(!over18Checkbox)}>I confirm that I am at least 18 (eighteen) years of age</Text>
                        </View>

                        <View style={styles.checkboxRow}>
                            <CheckBox
                                style={styles.checkbox}
                                disabled={false}
                                value={tsAndCsCheckbox}
                                onValueChange={(newValue) => setTsAndCsCheckbox(newValue)}
                                tintColors={{ true: colors.primary }}
                                
                            />
                            <Text style={styles.checkBoxText} onPress={() => setTsAndCsCheckbox(!tsAndCsCheckbox)}>
                                <Text>I confirm that I have read and agreed to the </Text>
                                <Text style={{color: colors.primary}} onPress={() => console.log("go to terms and conditions")}>Terms and Conditions </Text>
                                <Text>and </Text>
                                <Text style={{ color: colors.primary }} onPress={() => console.log("go to privacy policy")}>Privacy Policy</Text>
                            </Text>

                        </View>

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
                                <View style={[styles.signInButton, validToSubmit ? undefined : {backgroundColor:colors.light_gray}]}>
                                    <Text style={[styles.buttonFont, { fontSize: 20 }, validToSubmit ? undefined : { color: colors.gray }]}>Create account</Text>
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