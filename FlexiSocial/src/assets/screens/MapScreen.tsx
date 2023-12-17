import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList} from "../../navigation/paramLists";
import { useDispatch, useSelector } from "react-redux";
import { PermissionsAndroid, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { colors, googleMapsStyle } from "../../config/config";
import { SafeAreaView } from "react-native-safe-area-context";
import TagButton from "../components/TagButton";
import { setMapScreenToggle } from "../../redux/actions";
import MapScreenTagBar from "../components/MapScreenTagBar";
import EventInfo from "../components/EventInfo";
import EventFullInfoPanel from "../components/EventFullInfoPanel";
import {  useEffect, useRef, useState } from "react";
import GetLocation from "react-native-get-location";
import Geolocation from "@react-native-community/geolocation";
import { State } from "../../redux/state";


type MapScreenProps = NativeStackScreenProps<AppStackParamList, "MapScreen">;

export const MapScreen: React.FC<MapScreenProps> = (props) => {

    const mapRef = useRef<MapView>(null);
    const [region, setRegion] = useState<Region|null>(null);
    const toggles = useSelector((state: State) => state.persistent.mapScreen.toggles)

    // set initial location
    useEffect(() => {
        Geolocation.getCurrentPosition(
            position => {
                // apparently mapRef.current should never be null here
                // because this runs after the MapView has rendered.
                mapRef.current?.animateToRegion({
                    ...position.coords,
                    latitudeDelta: 0.3,
                    longitudeDelta: 0.3,
                }, 1000)
            },
            error => console.error(error),
            { enableHighAccuracy: true, timeout: 60000 }
        );
    }, [])


    // load markers
    useEffect(() => {
        if (region) {
            // load the events that are to be displayed.
            
        }
    }, [region, toggles], )


    return (
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
                onRegionChangeComplete={(region) => setRegion(region)}
            >
                <Marker 
                    coordinate={{ latitude:52.787696579248234, longitude: -0.1533563650942924}}
                    pinColor={colors.primary}
                    // TODO add a custom marker here!!
                    // image={require("../../assets/images/ADD_MARKER_HERE_TODO.png")}
                />
            </MapView>



            <SafeAreaView 
                pointerEvents="box-none" // allows users to interact with the map behind this view.
                style={StyleSheet.absoluteFillObject}
            >   
                <MapScreenTagBar/>

                <View style={StyleSheet.absoluteFillObject}>
                    {/* <EventFullInfoPanel eventId={1}/> */}
                </View>

            </SafeAreaView>
        </View>
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