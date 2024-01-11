import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList} from "../../navigation/paramLists";
import { useDispatch, useSelector } from "react-redux";
import { Animated, PanResponder, PermissionsAndroid, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { colors, googleMapsStyle } from "../../config/config";
import { SafeAreaView } from "react-native-safe-area-context";
import TagButton from "../components/TagButton";
import { addMarkers, setEventInfoPanelStatus, setMapScreenToggle } from "../../redux/actions";
import MapScreenTagBar from "../components/MapScreenTagBar";
import EventInfo from "../components/EventInfo";
import EventFullInfoPanel from "../components/EventFullInfoPanel";
import {  useEffect, useRef, useState } from "react";
import GetLocation from "react-native-get-location";
import Geolocation from "@react-native-community/geolocation";
import { State } from "../../redux/state";
import { useLazyQuery } from "@apollo/client";
import { GET_EVENTS_ON_SCREEN } from "../../graphql/queries";
import AppMenu from "../components/AppMenu"

const menuWidth = 300;


type MapScreenProps = NativeStackScreenProps<AppStackParamList, "MapScreen">;

export const MapScreen: React.FC<MapScreenProps> = (props) => {

    // const [menuActive, setMenuActive] = useState(false);
    // const menuPan = useRef(new Animated.Value(0)).current;
    // const menuPanResponder = useRef(PanResponder.create({
    //     onMoveShouldSetPanResponder: (event, gestureState) => {
    //         event.stopPropagation();
    //         return false;
    //     },
    //     // map dx directly to the animated variable.
    //     onPanResponderMove: (event, gestureState) =>  {
    //         event.stopPropagation();
    //         menuPan.setValue((menuActive? menuWidth: 0) + gestureState.dx)
    //     },
    //     // onShouldBlockNativeResponder: () => true
    //     onStartShouldSetPanResponderCapture: (e, gestureState) => true,
    //     onPanResponderStart: (event, gestureState) => event.stopPropagation(),
    //     onPanResponderEnd: (event, gestureState) => event.stopPropagation(),
    //     onStartShouldSetPanResponder: () => false,
    //     // onStartShouldSetPanResponderCapture: () => false,
    //     // onMoveShouldSetPanResponder: () => false,
    //     onMoveShouldSetPanResponderCapture: () => false,

    // })).current;

    const mapRef = useRef<MapView>(null);
    // const toggles = useSelector((state: State) => state.persistent.mapScreen.toggles)
    const { markers, tilesLoaded } = useSelector((state: State) => state.nonPersistent.mapScreen);
    const eventInfoPanelStatus = useSelector((state: State) => state.nonPersistent.mapScreen.eventInfo)

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


    // add markers to the list when the queries complete.
    useEffect(() => {
        if (markersError) {
            console.error(markersError)
        }
        if (!markersLoading && markersData) {
            console.log("received data: " + JSON.stringify(markersData))
            if (markersData.eventsInBBox.tilesLoaded.length != 0) {
                dispatch(addMarkers(markersData.eventsInBBox.events, markersData.eventsInBBox.tilesLoaded))
            }
        }
    }, [markersLoading, markersData, markersError])


    // fetch new data when the user moves the screen.
    // NOTE this is an awful way of doing this I think, because if the screen moves while a query is in progress then the previous one will be cancelled wasting server resources. Maybe fix this if there is a better way
    async function getNewData(region: Region) {
        

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

    

    // create queries for new data
    // useEffect(() => {
    //     if (!markersLoading && requestNewData && region) {
    //         getMarkers({variables: {
    //             west: region.longitude,
    //             south: region.latitude,
    //             east: region.longitude+region.longitudeDelta,
    //             north: region.latitude + region.latitudeDelta,
    //             excludeTiles:     
    //         }})
    //         setRequestNewData(false);
    //     }
    // }, [markersLoading, region, requestNewData])


    return (
        <>
            <StatusBar
                // make the status bar transparent on android
                backgroundColor={"#00000000" /*transparent*/}
                translucent={true}
                barStyle={"dark-content"}
            />
            <View style={styles.container}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    customMapStyle={googleMapsStyle}
                    mapPadding={{
                        bottom: 0,
                        left: 0,
                        right: 0,
                        top: 45 // this prevents icons being hidden by the tags.
                        // TODO may cause issues on IOS - map padding might need to be increased to account for the notch
                    }}
                    onMapReady={() => {
                        PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                        )
                    }}
                    onRegionChangeComplete={getNewData}
                // moveOnMarkerPress={false}
                >
                    {markers.map((marker, i) =>
                        <Marker
                            coordinate={{ latitude: marker.lat, longitude: marker.lon }}
                            pinColor={colors.primary}
                            key={i}
                            onPress={() => dispatch(setEventInfoPanelStatus({ active: true, eventId: marker.id }))}
                        // TODO add a custom marker here!!
                        // image={require("../../assets/images/ADD_MARKER_HERE_TODO.png")}
                        />
                    )}

                </MapView>



                <SafeAreaView
                    pointerEvents="box-none" // allows users to interact with the map behind this view.
                    style={[StyleSheet.absoluteFillObject]}
                >



                    {/* menu at the side of the screen */}

                    {/* <Animated.View
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

                    <View style={{flex:1}}>
                        {eventInfoPanelStatus.active
                            ? <EventFullInfoPanel eventId={eventInfoPanelStatus.eventId} />
                            : undefined
                        }
                    </View>

                </SafeAreaView>
            </View>
        </>
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

});