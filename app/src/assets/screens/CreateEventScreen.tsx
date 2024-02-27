

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList, AuthStackParamList } from "../../navigation/paramLists";
import { Alert, FetchResult, KeyboardAvoidingView, PermissionsAndroid, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, googleMapsStyle, universalStyles } from "../../config/config";
import IconButton from "../components/IconButton";
import { faBuilding, faCalendar, faCalendarDays, faChevronDown, faChevronLeft, faCircle, faCircleInfo, faClock, faL, faLocation, faLocationDot, faPen, faPerson } from "@fortawesome/free-solid-svg-icons";
import { Shadow } from "react-native-shadow-2";
import { OutlinedTextField } from "rn-material-ui-textfield";
import { useCallback, useMemo, useRef, useState, version } from "react";
import CheckBox from "@react-native-community/checkbox";
import EntryBox from "../components/EntryBox";
import * as EmailValidator from 'email-validator';
import LoadingModal from "../components/LoadingModal";
import { useMutation } from "@apollo/client";
import { SIGN_UP } from "../../graphql/mutations";
import { useDispatch } from "react-redux";
import { Action } from "../../redux/reducer";
import { client } from "../../utils/apolloClientConfig";
import MapView from "react-native-maps";
import { isConstValueNode } from "graphql";
import LargeButton from "../components/LargeButton"
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";



type CreateEventScreenProps = NativeStackScreenProps<AppStackParamList, "CreateEventScreen">;

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation, route }) => {

    // prevent the user from changing data in forms if set
    const [submitting, setSubmitting] = useState<boolean>(false);

    // visiblility of modals.
    const [datePickerShown, setDatePickerShown] = useState(false);
    const [timePickerShown, setTimePickerShown] = useState(false);

    // refs for entry boxes in the forms
    const eventTitleRef = useRef<TextInput>(null);

    // values of the form
    const [title, setTitle] = useState("");
    const [marker, setMarker] = useState<{lat:number, lon:number}>();
    const [venue, setVenue] = useState("");
    const [dateTime, setDateTime] = useState(new Date(Date.now() + 3600000));
    const [duration, setDuration] = useState<number|null>(null);
    const [capacity, setCapacity] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    // whether errors display regardless of the user having not interacted with the box yet
    const [forceDisplayErrors, setForceDisplayErrors] = useState(false);




    function setMarkerLocation() {
        // open a new screen to set the event marker.
        console.log("Set marker location")
    }

    const onDateTimeChange = useCallback((date:Date) => {
        setDateTime(date);
        console.log("datetime set to " + date.toISOString())
    }, []);


    const validateEventTitle = useCallback((title: string) => {
        if (title.length == 0) {
            return "Required"
        }
        if (title.length > 255) {
            return "Maximum 255 characters"
        }
    }, []);

    const titleValidMessage = useMemo(() => validateEventTitle(title), [title]);

    const validateVenueName = useCallback((venueName: string) => {
        if (venueName.length == 0) {
            return "Required"
        }
        if (venueName.length > 255) {
            return "Maximum 255 characters"
        }
    }, []);

    const venueValidMessage = useMemo(() => validateVenueName(venue), [venue])

    const validateDateTime = useCallback((dateTime: Date) => {
        if (dateTime < new Date(Date.now())) {
            return "Event can't be in the past"
        }
        if (dateTime > new Date(Date.now() + 31536000000)) {
            return "Event can't be more than a year in the future"
        }
    }, []);

    const dateTimeValidMessage = useMemo(() => validateDateTime(dateTime), [dateTime]);

    const validateCapacity = useCallback((capacity: string) => {
        if (capacity === undefined) {
            return "Required"
        }
        if (capacity.match(/[^0-9]/)) {
            return "Contains non-numerical digits"
        }
        let capacityInt = parseInt(capacity);
        if (isNaN(capacityInt)) {
            return "Required"
        }
        if (capacityInt < 1) {
            return "Must be positive"
        }
        if (capacityInt > 10000) {
            return "Maximum capacity 10,000"
        }
        if (capacityInt % 1 != 0) {
            return "Must be a whole number"
        }
    }, []);

    const capacityValidMessage = useMemo(() => validateCapacity(capacity), [capacity]);


    const validateDuration = useCallback((duration:number|null) => {
        if (duration === null) {
            return "Required"
        }
        if (duration <= 0) {
            return "Must be positive"
        }
        if (duration > 24*60) {
            return "Max duration 24 hours"
        }
        if (duration % 1 != 0) {
            return "Must be a whole number of minutes"
        }
    }, [])

    const durationValidMessage = useMemo(() => validateDuration(duration), [duration]);

    const validateDescription = useCallback((description:string) => {
        if (description.length > 8000) {
            return "8000 characters maximum"
        }
    }, [])

    const descriptionValidMessage = useMemo(() => validateDescription(description), [description]);

    const validToSubmit = !titleValidMessage && !venueValidMessage && !dateTimeValidMessage && !durationValidMessage && !capacityValidMessage && !descriptionValidMessage;

    async function submit() {

        if (!validToSubmit) {
            const badFields = [];
            titleValidMessage && badFields.push("Event title");
            venueValidMessage && badFields.push("Name of venue/location");
            dateTimeValidMessage && badFields.push("Date and time");
            durationValidMessage && badFields.push("Approx duration");
            capacityValidMessage && badFields.push("Capacity");
            descriptionValidMessage && badFields.push("Description");
            setForceDisplayErrors(true);
            const lol = badFields.join(", ")
            // const errorString = "The following fields are not complete or not valid: " + badFields.join(", ");
            const errorString = "The following fields are not complete or not valid: " + lol;
            Alert.alert("Form not complete", errorString);
            return;
        }

        console.log("Create event");

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
                style={{ flex: 1, flexDirection: "column" }}
            >
                {/* header */}
                <View style={styles.header}>
                    <View style={[styles.headerHorizontalSpace, { alignItems: "flex-end" }]}>
                        <IconButton
                            icon={faChevronLeft}
                            style={{ backgroundColor: colors.white }}
                            iconStyle={{ color: colors.primary }}
                            onPress={navigation.goBack}
                        />
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <Text style={styles.headerText}>{"Create event"}</Text>
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

                        {/* =========================== Event title entry box =========================== */}
                        <EntryBox
                            icon={faPen}
                            title="Event title"
                            value={title}
                            onChangeValue={setTitle}
                            style={styles.entryBox}
                            ref={eventTitleRef}
                            valid={!titleValidMessage}
                            message={titleValidMessage}
                            forceDisplayErrors={forceDisplayErrors}
                            textInputProps={{
                                onSubmitEditing: () => {
                                    // passwordRef.current?.focus();
                                },
                                onChangeText(text) {
                                    // setEmail(text);
                                    // setEmailValid(text == "" || EmailValidator.validate(text));
                                },
                                blurOnSubmit: false,
                                returnKeyType: "next",
                                spellCheck: false,
                                editable: !submitting,
                            }}
                        />

                        {/* =========================== Marker entry box =========================== */}
                        <EntryBox
                            icon={faLocationDot}
                            title="Marker"
                            // valid={true}

                            style={styles.entryBox}
                            // ref={eventTitleRef}
                            display="none"
                            forceDisplayErrors={forceDisplayErrors}
                        >
                            <Shadow
                                style={[{ width: "100%" }]}
                                offset={[0, 2]}
                                distance={3}
                                startColor={"#CCC"}
                                endColor={colors.white}
                            >
                                <TouchableOpacity 
                                    style={styles.mapWindow}
                                    onPress={setMarkerLocation}
                                >
                                    <MapView
                                        // ref={mapRef}
                                        style={StyleSheet.absoluteFillObject}
                                        customMapStyle={googleMapsStyle}
                                        onMapReady={() => {
                                            PermissionsAndroid.request(
                                                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                                            )
                                        }}
                                        // TODO region should be set around the marker::
                                        // region={{latitude: 0, longitude: 0, latitudeDelta: 1, longitudeDelta: 1}}
                                    >
                                        {/* TODO marker goes here, if it has been set. */}
                                    </MapView>

                                    {/* prevent the user from panning the map here - put a transparent view above it */}
                                    <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: "column", pointerEvents:"box-only"}} >
                                        <LargeButton 
                                            text="Tap to set marker location" 
                                            onPress={setMarkerLocation} 
                                            style={{alignSelf:"center", marginTop:20}}
                                        />
                                    </View>

                                </TouchableOpacity>
                               
                            </Shadow>


                        </EntryBox>
                        
                        {/* =========================== Name of venue/location entry box =========================== */}
                        <EntryBox
                            icon={faBuilding}
                            title="Name of venue/location"
                            valid={!venueValidMessage}
                            message={venueValidMessage}
                            value={venue}
                            onChangeValue={setVenue}
                            style={styles.entryBox}
                            forceDisplayErrors={forceDisplayErrors}
                            textInputProps={{
                                onSubmitEditing: () => {
                                    // passwordRef.current?.focus();
                                },
                                onChangeText(text) {
                                    // setEmail(text);
                                    // setEmailValid(text == "" || EmailValidator.validate(text));
                                },
                                blurOnSubmit: false,
                                returnKeyType: "next",
                                spellCheck: false,
                                editable: !submitting
                            }}
                        />

                        {/* =========================== Date and time entry box =========================== */}
                        <EntryBox
                            icon={faCalendarDays}
                            title="Date and time"
                            valid={!dateTimeValidMessage}
                            message={dateTimeValidMessage}
                            style={styles.entryBox}
                            display="box-only"
                            forceDisplayErrors={forceDisplayErrors}
                        >
                            {/* display current date and time */}
                            <Text style={universalStyles.p}>{dateTime.toLocaleDateString()}, {dateTime.toLocaleTimeString(undefined, {hour:"2-digit", minute:"2-digit"})}</Text>

                            {/* date picker */}
                            <LargeButton
                                text="Tap to set date"
                                onPress={() => setDatePickerShown(true)}
                            />
                            {datePickerShown &&
                                <DateTimePicker
                                    // testID="dateTimePicker"
                                    value={dateTime}
                                    mode={"date"}
                                    onChange={(event, date) => {
                                        setDatePickerShown(false);
                                        date && onDateTimeChange(date);
                                    }}                                
                                />
                            }

                            {/* time picker */}
                            <LargeButton
                                text="Tap to set time"
                                onPress={() => setTimePickerShown(true)}
                            />
                            {timePickerShown &&
                                <DateTimePicker
                                    // testID="dateTimePicker"
                                    value={dateTime}
                                    mode={"time"}
                                    is24Hour={true}
                                    onChange={(event, date) => {
                                        setTimePickerShown(false);
                                        date && onDateTimeChange(date);
                                    }}
                                />
                            }

                        </EntryBox>

                        {/* Duration and capacity. They both occupy 1 column. */}
                        <View style={{flexDirection:"row", justifyContent:"space-evenly"}}>

                            {/* =========================== Duration entry box =========================== */}
                            <EntryBox
                                icon={faClock}
                                title="Approx duration"
                                style={[styles.entryBox, {flex:1, marginRight: 10}]}
                                forceDisplayErrors={forceDisplayErrors}
                                display="box-only"
                                message={durationValidMessage}
                                valid={!durationValidMessage}
                            >
                                <RNPickerSelect
                                    value={duration}
                                    onValueChange={value => setDuration(value)}
                                    style={{
                                        inputAndroid: styles.dropdown,
                                        inputIOS: styles.dropdown,
                                        iconContainer: {
                                            justifyContent: "center",
                                            height:"100%"
                                        }
                                    }}
                                    Icon={() => <FontAwesomeIcon icon={faChevronDown} style={styles.drowdownChevron}/>}
                                    useNativeAndroidPickerStyle={false}
                                    items={[
                                        { label: '0:30', value: 30 },
                                        { label: '1:00', value: 60 },
                                        { label: '1:30', value: 90 },
                                        { label: '2:00', value: 120 },
                                        { label: '3:00', value: 180 },
                                        { label: '4:00', value: 240 },
                                        { label: '5:00', value: 300 },
                                        
                                    ]}
                                />
                            </EntryBox>

                            {/* =========================== Capacity entry box =========================== */}
                            <EntryBox
                                icon={faPerson}
                                title="Capacity"
                                value={capacity}
                                onChangeValue={setCapacity}
                                // remove non numeric characters and leading zeros.
                                coercer={value => value.replaceAll(/[^0-9]/g, "").replace(/^0*/, "")}
                                valid={!capacityValidMessage}
                                message={capacityValidMessage}
                                style={[styles.entryBox, { flex: 1, marginLeft:10}]}
                                forceDisplayErrors={forceDisplayErrors}
                                textInputProps={{
                                    onSubmitEditing: () => {
                                        // passwordRef.current?.focus();
                                    },
                                    onChangeText(text) {
                                        // setEmail(text);
                                        // setEmailValid(text == "" || EmailValidator.validate(text));
                                    },
                                    blurOnSubmit: false,
                                    returnKeyType: "next",
                                    spellCheck: false,
                                    editable: !submitting,
                                    inputMode: "numeric"
                                    // inputMode:
                                }}
                            />
                        </View>

                        {/* =========================== Description =========================== */}
                        <EntryBox
                            icon={faCircleInfo}
                            title="Description"
                            value={description}
                            onChangeValue={setDescription}
                            valid={!descriptionValidMessage}
                            message={descriptionValidMessage}
                            style={styles.entryBox}
                            forceDisplayErrors={forceDisplayErrors}
                            boxStyle={{
                                minHeight:150,
                            }}
                            textInputProps={{
                                blurOnSubmit: true,
                                returnKeyType: "done",
                                spellCheck: true,
                                editable: !submitting,
                                multiline: true,
                                style:{flex:1},
                                textAlignVertical:"top",
                            }}
                        />

  

                        {/* =========================== Submit button =========================== */}
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
                                <View style={[styles.submitButton, validToSubmit ? undefined : { backgroundColor: colors.light_gray }]}>
                                    <Text style={[styles.buttonFont, { fontSize: 20 }, validToSubmit ? undefined : { color: colors.gray }]}>Create event</Text>
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
        width: "100%",
        // height:75,
        minHeight: 75,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row"
    },

    // on either side of the page title. The icon is in the left one of these.
    // this is used to make the page title appear in the center of the screen.
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
    mapWindow: {
        width: "100%",
        height: 250
    },
  
    buttonFont: {
        alignSelf: "center",
        fontFamily: fonts.secondary.regular,
        color: colors.black
    },
    submitButton: {
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
    },

    dropdown: {
        flexDirection:"row",
        alignItems:"center",
        padding:0,
        paddingRight:20,
        ...universalStyles.p
    },

    drowdownChevron: {
        color: colors.primary,
    }

})