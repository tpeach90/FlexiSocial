import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList, AppTabNavigatorParamList} from "../../navigation/paramLists";
import { useDispatch, useSelector } from "react-redux";
import { Animated, BackHandler, PanResponder, PermissionsAndroid, ScrollView, StatusBar, StyleSheet, Text, View, Image} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { colors, googleMapsStyle, universalStyles } from "../../config/config";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import TagButton from "../components/TagButton";
import { addMarkers, setEventInfoPanelStatus, setMapScreenToggle } from "../../redux/actions";
import MapScreenTagBar from "../components/MapScreenTagBar";
import EventInfo from "../components/EventInfo";
import {  useCallback, useEffect, useMemo, useRef, useState } from "react";
import GetLocation from "react-native-get-location";
import Geolocation from "@react-native-community/geolocation";
import { State } from "../../redux/state";
import { useLazyQuery } from "@apollo/client";
import { GET_EVENTS_ON_SCREEN } from "../../graphql/queries";
import AppMenu from "../components/AppMenu"
import { BottomSheetScrollView, BottomSheetView, BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import EventInfoNew from "../components/EventInfoNew";
import EventInfoHeader from "../components/EventInfoHeader";
import { Action } from "../../redux/reducer";
import EventChatShort from "../components/EventChatShort";
import SideMenu from "react-native-side-menu-updated";
import { faDisplay } from "@fortawesome/free-solid-svg-icons";
import MapScreenIconButtons from "../components/MapScreenIconButtons";
import { useFocusEffect } from "@react-navigation/native";
import MarkerImg from "../images/marker";
import FastImage from "react-native-fast-image";

const menuWidth = 300;

type MapScreenProps = {}

export default function MapScreen(props:MapScreenProps) {

    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    // const toggles = useSelector((state: State) => state.persistent.mapScreen.toggles)
    const { markers, tilesLoaded } = useSelector((state: State) => state.nonPersistent.mapScreen);
    const eventInfoPanelStatus = useSelector((state: State) => state.nonPersistent.mapScreen.eventInfo);
    const sideMenuActive = useSelector((state: State) => state.nonPersistent.mapScreen.sideMenuActive);

    const [region, setRegion] = useState<Region>();

    // bottom sheet stuff.
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["30%", "90%"], []);
    const handleSheetChange = useCallback((index:number) => {
        if (index >= 1 && /* just for ts to be happy */ eventInfoPanelStatus.active) {
            dispatch<Action>({
                type:"setEventInfoPanelStatus",
                payload: {
                    ...eventInfoPanelStatus,
                    displayChat: true
                }
            })
        }
    }, [eventInfoPanelStatus]);
    const handleXButtonPress = useCallback(() => {
        // sheetRef.current?.dismiss()
        dispatch<Action>({ type: "setEventInfoPanelStatus", payload: { active: false } })
    }, [])
    const handleClosePress = useCallback(() => {
        dispatch<Action>({type: "setEventInfoPanelStatus", payload: {active: false}})
    }, []);

    // close the bottom sheet when the back key is pressed on Android.
    useFocusEffect(
        useCallback(() => {
            const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
                if (eventInfoPanelStatus.active) {
                    sheetRef.current?.dismiss();
                    return true; // don't bubble the event
                }
                return false; // bubble the event.
            });
            return () => subscription.remove();
        }, [eventInfoPanelStatus.active])
    );

    // open the bottom sheet if activated.
    useEffect(() => {
        if (eventInfoPanelStatus.active) {
            sheetRef.current?.present();
        } else {
            // If the user pulls to dismiss the sheet then the action is fired. In that case the sheet is already dismissed and this (shouldn't) have any effect.
            // bit nasty unfortunately.
            sheetRef.current?.dismiss();
        }
    }, [eventInfoPanelStatus.active])

    // query to load markers
    const [getMarkers, { loading: markersLoading, error: markersError, data: markersData }] = useLazyQuery(GET_EVENTS_ON_SCREEN)

    const dispatch = useDispatch();



    // set initial location
    useEffect(() => {
        Geolocation.getCurrentPosition(
            position => {
                // apparently mapRef.current should never be null here
                // because this runs after the MapView has rendered.
                mapRef.current?.animateToRegion({
                    ...position.coords,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000)
            },
            error => console.error(error),
            { enableHighAccuracy: true, timeout: 60000 }
        );
    }, [])

    // get markers when the screen changes
    useEffect(() => {
        if (region)
            getNewData(region);
    }, [region])


    // add markers to the list when the queries complete.
    useEffect(() => {
        if (markersError) {
            console.error(markersError)
        }
        if (!markersLoading && markersData) {
            // console.log("received data: " + JSON.stringify(markersData))
            if (markersData.eventsInBBox.tilesLoaded.length != 0) {
                dispatch(addMarkers(markersData.eventsInBBox.events, markersData.eventsInBBox.tilesLoaded))
            }
        }
    }, [markersLoading, markersData, markersError])


    // fetch new data when the user moves the screen.
    // NOTE this is an awful way of doing this I think, because if the screen moves while a query is in progress then the previous one will be cancelled wasting server resources. Maybe fix this if there is a better way
    async function getNewData(region: Region) {
        
        // prevent if too far out.
        if (region.latitudeDelta > 1 || region.longitudeDelta > 1)
            return;

        getMarkers({
            variables: {
                west: region.longitude - region.longitudeDelta/2,
                south: region.latitude - region.latitudeDelta/2,
                east: region.longitude + region.longitudeDelta / 2,
                north: region.latitude + region.latitudeDelta / 2,
                excludeTiles: tilesLoaded,
                earliest: new Date(Date.now()).toISOString()
            }
        })
    }

    return (
        <BottomSheetModalProvider>
            <StatusBar
                // make the status bar transparent on android
                backgroundColor={"#00000000" /*transparent*/}
                translucent={true}
                barStyle={"dark-content"}
            />

            {/* ignore the intellisense error - It seems to work fine. 
            Possibly caused by using react-native-side-menu-updated with the old non updated type declarations module.*/}
            {/* @ts-ignore */}
            <SideMenu
                isOpen={sideMenuActive}
                // hiddenMenuOffset={100}
                menu={<AppMenu/>}
                // this action also closes the bottom modal if open.
                onChange={(active) => dispatch<Action>({ type: "setMapScreenSideMenuActive", payload: active })}
            >
                <View style={styles.container}>

                    {/* map. */}
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        customMapStyle={googleMapsStyle}
                        mapPadding={insets} // ensure google buttons/etc render inside the safe area
                        onMapReady={() => {
                            PermissionsAndroid.request(
                                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                            )
                        }}
                        onRegionChangeComplete={setRegion}
                        toolbarEnabled={false}
                    >
                        {markers.map((marker, i) =>
                            <Marker
                                coordinate={{ latitude: marker.lat, longitude: marker.lon }}
                                pinColor={colors.primary}
                                key={i}
                                onPress={() => dispatch<Action>({
                                    type: "setEventInfoPanelStatus",
                                    payload: {
                                        active: true,
                                        eventId: marker.id,
                                        title: marker.name,
                                        displayChat: false
                                    }
                                })}
                                // title={marker.name}
                            // TODO add a custom marker here!!
                                // image={require("../images/marker-low-res.png")}
                            >
                                <View style={styles.markerLabelContainer} >
                                    <View style={styles.markerLabel}>
                                        <Text style={styles.markerLabelText} numberOfLines={1}>{marker.name}</Text>
                                    </View>
                                    <Image 
                                        source={require("../images/marker.png")}
                                        style={styles.marker}
                                    />
                                </View>
                            </Marker>
                        )}

                    </MapView>


                    {/* things that sit on top of the map. */}
                    <SafeAreaView
                        pointerEvents="box-none" // allows users to interact with the map behind this view.
                        style={[StyleSheet.absoluteFillObject]}
                    >

                        <MapScreenIconButtons
                            style={{
                                position:"absolute",
                                
                                right:10,
                                bottom:10
                            }}
                        />


                        {/* menu at the side of the screen

                    <Animated.View
                        style={{
                            transform: [{ translateX: menuPan }],
                            width:0,

                            // position:"absolute"
                        }}
                        // pointerEvents={"box-none"}
                        {...menuPanResponder.panHandlers}
                    >

                        <AppMenu
                            open={true}
                            width={menuWidth}
                        />
                    </Animated.View> */}


                        {/* <MapScreenTagBar /> */}

                        {/* <View style={{flex:1}}>
                        {eventInfoPanelStatus.active
                            ? <EventFullInfoPanel eventId={eventInfoPanelStatus.eventId} />
                            : undefined
                        }
                    </View> */}

                        {/* Event sheet. */}
                        <BottomSheetModal
                            ref={sheetRef}
                            snapPoints={snapPoints}
                            onChange={handleSheetChange}
                            style={{ paddingHorizontal: 25 }}
                            onDismiss={handleClosePress}
                            enablePanDownToClose={true}
                            backgroundStyle={{ backgroundColor: "#FFFE" }}
                        >
                            <BottomSheetView>
                                <EventInfoHeader
                                    title={eventInfoPanelStatus.title ?? ""}
                                    closeEventPressed={handleXButtonPress}
                                />
                            </BottomSheetView>
                            <BottomSheetScrollView>
                                <EventInfoNew
                                    eventId={eventInfoPanelStatus.eventId}
                                />
                                {eventInfoPanelStatus.displayChat
                                    ? <EventChatShort eventId={eventInfoPanelStatus.eventId} />
                                    : undefined
                                }
                            </BottomSheetScrollView>
                        </BottomSheetModal>

                    </SafeAreaView>
                </View>
            </SideMenu>
        </BottomSheetModalProvider>
    )

}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1, //the container will fill the whole screen.
        justifyContent: "flex-end",
        alignItems: "center",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerLabel: {
        backgroundColor: colors.primary, 
        paddingHorizontal: 5, 
        paddingVertical: 1, 
        borderRadius: 999, 
        marginBottom: 3,
    },
    markerLabelText: {
        ...universalStyles.h2,
        fontSize:12,
        color: colors.white,
        maxWidth:100,
    },
    markerLabelContainer: { 
        flexDirection: "column", 
        alignItems: "center", 
        // height: 50 
    },

    marker: {
        height: 50,
        width: 50,
        resizeMode:"contain",
        flex: 1
    }

});