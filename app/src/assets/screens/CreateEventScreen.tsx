

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList, } from "../../navigation/paramLists";
import { Alert, BackHandler, KeyboardAvoidingView, PermissionsAndroid, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, googleMapsStyle, universalStyles } from "../../config/config";
import IconButton from "../components/IconButton";
import { faBuilding, faCalendarDays, faChevronDown, faChevronLeft, faCircleInfo, faClock, faLocationDot, faPen, faPerson } from "@fortawesome/free-solid-svg-icons";
import { Shadow } from "react-native-shadow-2";
import { useCallback, useMemo, useState } from "react";
import EntryBox from "../components/EntryBox";
import LoadingModal from "../components/LoadingModal";
import MapView, { LatLng, Marker } from "react-native-maps";
import LargeButton from "../components/LargeButton"
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import SetMarkerModal from "../components/SetMarkerModal";
import { useMutation } from "@apollo/client";
import { CREATE_EVENT } from "../../graphql/mutations";
import { useFocusEffect } from "@react-navigation/native";



type CreateEventScreenProps = NativeStackScreenProps<AppStackParamList, "CreateEventScreen">;

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation, route }) => {

    // prevent the user from changing data in forms if set
    const [submitting, setSubmitting] = useState<boolean>(false);

    // visiblility of modals.
    const [datePickerShown, setDatePickerShown] = useState(false);
    const [timePickerShown, setTimePickerShown] = useState(false);
    const [markerModalShown, setMarkerModalShown] = useState(false);

    // values of the form
    const [title, setTitle] = useState("");
    const [marker, setMarker] = useState<LatLng>();
    const [venue, setVenue] = useState("");
    const [dateTime, setDateTime] = useState(new Date(Date.now() + 3600000));
    const [duration, setDuration] = useState<number|null>(null);
    const [capacity, setCapacity] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    // whether errors display regardless of the user having not interacted with the box yet
    const [forceDisplayErrors, setForceDisplayErrors] = useState(false);

    // mutation to submit the event
    const [createEventMutation, { data, loading, error }] = useMutation(CREATE_EVENT);

    // interrupt presses to the back key on android.
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                backOrCancel();
                // prevent the back event from bubbling
                return true;
            }
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    function backOrCancel() {
        Alert.alert("You have unsaved changes", "Quit creating event?", [{text:"Cancel"},{text:"Quit", onPress:() => navigation.goBack()}])
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

    const validateMarker = useCallback((marker: LatLng | undefined) => {
        if (!marker) {
            return "Required"
        }
    }, [])

    const markerValidMessage = useMemo(() => validateMarker(marker), [marker]);

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
        const now = new Date(Date.now());
        if (dateTime < now) {
            return "Event can't be in the past"
        }
        if (dateTime > new Date(Date.now() + 31536000000)) {
            return "Event can't be more than a year in the future"
        }
    }, []);

    // don't memoize this because validity could change depending on the current time
    const dateTimeValidMessage = validateDateTime(dateTime);

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

        const badFields = [];
        validateEventTitle(title) && badFields.push("Event title");
        validateMarker(marker) && badFields.push("Marker")
        validateVenueName(venue) && badFields.push("Name of venue/location");
        validateDateTime(dateTime) && badFields.push("Date and time");
        validateDuration(duration) && badFields.push("Approx duration");
        validateCapacity(capacity) && badFields.push("Capacity");
        validateDescription(description) && badFields.push("Description");
        if (badFields.length > 0) {
            setForceDisplayErrors(true);
            const errorString = "The following fields are not complete or not valid: " + badFields.join(", ");
            Alert.alert("Form not complete", errorString);
            return;
        }

        setSubmitting(true);

        await createEventMutation({variables: {
            name:title,
            description: description,
            latitude: marker?.latitude,
            longitude: marker?.longitude,
            location: venue,
            time: dateTime.toISOString(),
            duration: duration,
            capacity: parseInt(capacity)
        }})
            .then(mutationResult => {
                if (mutationResult.errors) {
                    Alert.alert(mutationResult.errors.map(e => e.message).join("\n"))
                    setSubmitting(false);
                    return;
                }
                if (mutationResult.data) {
                    // successfully created the event.
                    navigation.goBack()
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

            <SetMarkerModal
                location={marker}
                onChangeLocation={setMarker}
                visible={markerModalShown}
                onChangeVisibility={setMarkerModalShown}
            />

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
                            onPress={backOrCancel}
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
                            valid={!titleValidMessage}
                            message={titleValidMessage}
                            forceDisplayErrors={forceDisplayErrors}
                            textInputProps={{
                                blurOnSubmit: true,
                                returnKeyType: "done",
                                spellCheck: false,
                                editable: !submitting,
                            }}
                        />

                        {/* =========================== Marker entry box =========================== */}
                        <EntryBox
                            icon={faLocationDot}
                            title="Marker"
                            valid={!markerValidMessage}
                            message={markerValidMessage}
                            style={styles.entryBox}
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
                                    onPress={() => setMarkerModalShown(true)}
                                >
                                    <MapView
                                        style={StyleSheet.absoluteFillObject}
                                        customMapStyle={googleMapsStyle}
                                        onMapReady={() => {
                                            PermissionsAndroid.request(
                                                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                                            )
                                        }}
                                        region={marker && { ...marker, latitudeDelta: 0.003, longitudeDelta: 0.003 }}
                                    >
                                        {marker &&
                                            <Marker
                                                coordinate={marker}
                                                pinColor={colors.primary}
                                            />
                                        }
                                    </MapView>

                                    {/* prevent the user from panning the map here - put a transparent view above it */}
                                    <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: "column", pointerEvents:"box-only"}} >
                                        <LargeButton 
                                            text="Tap to set marker location" 
                                            onPress={() => setMarkerModalShown(true)}
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
                                blurOnSubmit: true,
                                returnKeyType: "done",
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
                                    blurOnSubmit: true,
                                    returnKeyType: "done",
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
                                returnKeyType: "none",
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