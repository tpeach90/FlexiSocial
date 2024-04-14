

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList, } from "../../navigation/paramLists";
import { Alert, BackHandler, Image, KeyboardAvoidingView, PermissionsAndroid, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Action } from "../../redux/reducer";



type CreateEventScreenProps = NativeStackScreenProps<AppStackParamList, "CreateEventScreen">;


type FormValues = {
    title: string,
    marker?: LatLng,
    venue: string,
    dateTime: Date,
    duration:number|null,
    capacity:string,
    description:string,
}

const defaultValues : FormValues = {
    title: "",
    marker: undefined,
    venue: "",
    dateTime: new Date(Date.now() + 3600000),
    duration: null,
    capacity: "",
    description: ""
}

const fieldNames: Record<keyof FormValues, string> = {
    title: "Event title",
    marker: "Marker",
    venue: "Name of venue/location",
    dateTime: "Date and time",
    duration: "Approx duration",
    capacity: "Capacity",
    description: "Description"
}

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation, route }) => {

    const dispatch = useDispatch();

    // visiblility of modals.
    const [datePickerShown, setDatePickerShown] = useState(false);
    const [timePickerShown, setTimePickerShown] = useState(false);
    const [markerModalShown, setMarkerModalShown] = useState(false);

    // the form.
    const {control, handleSubmit, formState:{isValid, isDirty, isSubmitting}} = useForm<FormValues>({mode:"all", defaultValues});

    // mutation to submit the new event
    const [createEventMutation, {}] = useMutation(CREATE_EVENT);

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
        }, [isDirty])
    );

    const backOrCancel = useCallback(() => {
        if(isDirty) {
            Alert.alert("You have unsaved changes", "Quit creating event?", [{ text: "Cancel" }, { text: "Quit", onPress: () => navigation.goBack() }])
        } else {
            navigation.goBack();
        }
    }, [isDirty]);



    const validateEventTitle = useCallback((title: string) => {
        if (title.length == 0) {
            return "Required"
        }
        if (title.length > 255) {
            return "Maximum 255 characters"
        }
    }, []);

    const validateMarker = useCallback((marker: LatLng | undefined) => {
        if (!marker) {
            return "Required"
        }
    }, [])

    const validateVenueName = useCallback((venueName: string) => {
        if (venueName.length == 0) {
            return "Required"
        }
        if (venueName.length > 255) {
            return "Maximum 255 characters"
        }
    }, []);

    const validateDateTime = useCallback((dateTime: Date) => {
        const now = new Date(Date.now());
        if (dateTime < now) {
            return "Event can't be in the past"
        }
        if (dateTime > new Date(Date.now() + 31536000000)) {
            return "Event can't be more than a year in the future"
        }
    }, []);

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

    const validateDescription = useCallback((description:string) => {
        if (description.length > 8000) {
            return "8000 characters maximum"
        }
    }, [])

  
    const onSubmit = handleSubmit(async (data, event) => {

        // form is validated when the submit button is pressed, as well as when a field is changed
        // so we can assume here that the data entered is valid.

        let result;

        try {
            result = await createEventMutation({
                variables: {
                    name: data.title,
                    description: data.description,
                    latitude: data.marker?.latitude,
                    longitude: data.marker?.longitude,
                    location: data.venue,
                    time: data.dateTime.toISOString(),
                    duration: data.duration,
                    capacity: parseInt(data.capacity)
                }
            });
        
        } catch (e) {
            if (e instanceof Error)
                Alert.alert(e.message);
            return;
        }

        if (result.errors) {
            Alert.alert(result.errors.map(e => e.message).join("\n"))
            return;
        }
        if (result.data) {
            // successfully created the event.
            // clear the event marker cache
            dispatch<Action>({type:"clearMarkers"});

            navigation.goBack()
        }



    }, (errors, event) => {

        // in case of an invalid form, compile a list of errors for the user.
        const errorList = [];
        for (const field in errors) {
            if (fieldNames.hasOwnProperty(field)) {
                // @ts-expect-error
                errorList.push(fieldNames[field] + ": " + errors[field].message + ".")
            }
        }
        Alert.alert("Form not complete", "The following fields have errors:\n" + errorList.join("\n"))
    })


    return (
        <>
            {/* prevent the user doing anything if submitting. */}
            <LoadingModal visible={isSubmitting} />


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
                        <Controller
                            name="title"
                            control={control}
                            render={({field: {onChange, value, onBlur}, fieldState:{invalid, error}}) => (
                                <EntryBox
                                    icon={faPen}
                                    title={fieldNames.title}
                                    value={value}
                                    onChangeValue={onChange}
                                    style={styles.entryBox}
                                    valid={!invalid}
                                    message={error?.message}
                                    textInputProps={{
                                        blurOnSubmit: true,
                                        returnKeyType: "done",
                                        spellCheck: false,
                                        editable: !isSubmitting,
                                        onBlur:onBlur
                                    }}
                                />
                            )}
                            rules={{
                                validate: (value) => validateEventTitle(value) || true
                            }}
                        />



                        {/* =========================== Marker entry box =========================== */}
                        <Controller
                            name="marker"
                            control={control}
                            render={({ field: { onChange, value:marker, onBlur }, fieldState: { invalid, error} }) => <>

                                <SetMarkerModal
                                    location={marker}
                                    onChangeLocation={onChange}
                                    visible={markerModalShown}
                                    onChangeVisibility={setMarkerModalShown}
                                />

                                <EntryBox
                                    icon={faLocationDot}
                                    title={fieldNames.marker}
                                    valid={!invalid}
                                    message={error?.message}
                                    style={styles.entryBox}
                                    display="none"
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
                                                    >
                                                        <Image
                                                            source={require("../images/marker.png")}
                                                            style={styles.marker}
                                                        />
                                                    </Marker>
                                                }
                                            </MapView>

                                            {/* prevent the user from panning the map here - put a transparent view above it */}
                                            <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: "column", pointerEvents: "box-only" }} >
                                                <LargeButton
                                                    text="Tap to set marker location"
                                                    onPress={() => setMarkerModalShown(true)}
                                                    style={{ alignSelf: "center", marginTop: 20 }}
                                                />
                                            </View>

                                        </TouchableOpacity>

                                    </Shadow>


                                </EntryBox>
                            </>}
                            rules={{
                                validate: (value) => validateMarker(value) || true
                            }}
                        
                        
                        />


                        {/* =========================== Name of venue/location entry box =========================== */}
                        <Controller
                            name="venue"
                            control={control}
                            render={({ field: { onChange, value, onBlur }, fieldState: { invalid, error } }) => (
                                <EntryBox
                                    icon={faBuilding}
                                    title={fieldNames.venue}
                                    valid={!invalid}
                                    message={error?.message}
                                    value={value}
                                    onChangeValue={onChange}
                                    style={styles.entryBox}
                                    textInputProps={{
                                        blurOnSubmit: true,
                                        returnKeyType: "done",
                                        spellCheck: false,
                                        editable: !isSubmitting,
                                        onBlur: onBlur
                                    }}
                                />
                            )}
                            rules={{
                                validate: (value) => validateVenueName(value) || true
                            }}
                        />

                        {/* =========================== Date and time entry box =========================== */}
                        <Controller
                            name="dateTime"
                            control={control}
                            render={({ field: { onChange, value: dateTime }, fieldState: { invalid, error } }) => (
                                <EntryBox
                                    icon={faCalendarDays}
                                    title={fieldNames.dateTime}
                                    valid={!invalid}
                                    message={error?.message}
                                    style={styles.entryBox}
                                    display="box-only"
                                >
                                    {/* display current date and time */}
                                    <Text style={universalStyles.p}>{dateTime.toLocaleDateString()}, {dateTime.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</Text>

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
                                                date && onChange(date);
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
                                                date && onChange(date);
                                            }}
                                        />
                                    }

                                </EntryBox>
                            )}
                            rules={{
                                validate: (value) => validateDateTime(value) || true
                            }}
                        />


                        {/* Duration and capacity. They both occupy 1 column. */}
                        <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>

                            {/* =========================== Duration entry box =========================== */}
                            <Controller
                                name="duration"
                                control={control}
                                render={({ field: { onChange, value: duration }, fieldState: { invalid, error } }) => (
                                    <EntryBox
                                        icon={faClock}
                                        title={fieldNames.duration}
                                        style={[styles.entryBox, { flex: 1, marginRight: 10 }]}
                                        display="box-only"
                                        message={error?.message}
                                        valid={!invalid}
                                    >
                                        <RNPickerSelect
                                            value={duration}
                                            onValueChange={onChange}
                                            style={{
                                                inputAndroid: styles.dropdown,
                                                inputIOS: styles.dropdown,
                                                iconContainer: {
                                                    justifyContent: "center",
                                                    height: "100%"
                                                }
                                            }}
                                            Icon={() => <FontAwesomeIcon icon={faChevronDown} style={styles.drowdownChevron} />}
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
                            )}
                                rules={{
                                    validate: (value) => validateDuration(value) || true
                                }}
                            />

                            

                            {/* =========================== Capacity entry box =========================== */}
                            <Controller
                                name="capacity"
                                control={control}
                                render={({ field: { onChange, value: capacity, onBlur }, fieldState: { invalid, error } }) => (
                                    <EntryBox
                                        icon={faPerson}
                                        title={fieldNames.capacity}
                                        value={capacity}
                                        onChangeValue={onChange}
                                        // remove non numeric characters and leading zeros.
                                        coercer={value => value.replaceAll(/[^0-9]/g, "").replace(/^0*/, "")}
                                        valid={!invalid}
                                        message={error?.message}
                                        style={[styles.entryBox, { flex: 1, marginLeft: 10 }]}
                                        textInputProps={{
                                            blurOnSubmit: true,
                                            returnKeyType: "done",
                                            spellCheck: false,
                                            editable: !isSubmitting,
                                            inputMode: "numeric",
                                            onBlur: onBlur
                                        }}
                                    />
                                )}
                                rules={{
                                    validate: (value) => validateCapacity(value) || true
                                }}
                            />
                            
                        </View>
                        
                        {/* =========================== Description =========================== */}

                        <Controller
                            name="description"
                            control={control}
                            render={({ field: { onChange, value: description, onBlur }, fieldState: { invalid, error } }) => (
                                <EntryBox
                                    icon={faCircleInfo}
                                    title={fieldNames.description}
                                    value={description}
                                    onChangeValue={onChange}
                                    valid={!invalid}
                                    message={error?.message}
                                    style={styles.entryBox}
                                    boxStyle={{
                                        minHeight: 150,
                                    }}
                                    textInputProps={{
                                        blurOnSubmit: true,
                                        returnKeyType: "none",
                                        spellCheck: true,
                                        editable: !isSubmitting,
                                        multiline: true,
                                        style: { flex: 1 },
                                        textAlignVertical: "top",
                                        onBlur:onBlur
                                    }}
                                />
                            )}
                            rules={{
                                validate: (value) => validateDescription(value) || true
                            }}
                        />
 

  

                        {/* =========================== Submit button =========================== */}
                        <TouchableOpacity
                            onPress={onSubmit}
                            style={[styles.buttonContainer]}
                            disabled={isSubmitting}
                        >
                            <Shadow
                                style={[{ width: "100%" }]}
                                offset={[0, 2.5]}
                                distance={3}
                                startColor={"#AAA"}
                                endColor={colors.white}
                            >
                                <View style={[styles.submitButton, isValid ? undefined : { backgroundColor: colors.light_gray }]}>
                                    <Text style={[styles.buttonFont, { fontSize: 20 }, isValid ? undefined : { color: colors.gray }]}>Create event</Text>
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
    },

    marker: { 
        height: 50, 
        width: 50, 
        resizeMode: 
        "contain", flex: 1
    }

})