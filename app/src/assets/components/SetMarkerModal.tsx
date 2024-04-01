import { useState } from 'react';
import { Alert, Image, Modal, PermissionsAndroid, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { LatLng, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, googleMapsStyle, universalStyles } from '../../config/config';
import LargeButton from './LargeButton';



interface SetMarkerModalProps {
    location?: LatLng,
    onChangeLocation?: (location?: LatLng) => any,
    visible?: boolean,
    onChangeVisibility?: (visible: boolean) => any
}

export default function SetMarkerModal(props: SetMarkerModalProps) {

    // default values
    props = {
        visible:false,
        ...props
    }

    // marker that appears as the user is setting the location.
    // this is not made permanent until OK is pressed.
    const [tempMarker, setTempMarker] = useState<LatLng>();

    function cancel() {

        // reset the position of the temporary marker and close.

        props.onChangeVisibility?.(false)
        setTempMarker(undefined);
    }

    function confirm() {
        if (tempMarker) {
            props.onChangeLocation?.(tempMarker);
            setTempMarker(undefined);
        }
        props.onChangeVisibility?.(false)
    }

    return <>
        {/* background */}
        <Modal
            visible={props.visible}
            transparent={true}
            animationType='fade'
            onRequestClose={cancel}
            style={StyleSheet.absoluteFill}
            statusBarTranslucent
        >
            {/* darken the background */}
            <View style={styles.background}/>
        </Modal>
        
        {/* window */}
        <Modal
            visible={props.visible}
            transparent={true}
            animationType='fade'
            onRequestClose={cancel}
            statusBarTranslucent
        >
            {/* clicking outside the window cancels. */}
            <Pressable
                style={{ position: 'absolute', height: "100%", width: "100%" }}
                onPressOut={cancel}
            />
            <SafeAreaView style={styles.windowContainer}>
                <View style={styles.window}>
                    <MapView
                        // ref={mapRef}
                        style={styles.mapView}
                        customMapStyle={googleMapsStyle}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        onMapReady={() => {
                            PermissionsAndroid.request(
                                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                            )
                        }}
                        onPress={(event) => setTempMarker(event.nativeEvent.coordinate)}
                        onPoiClick={(event) => setTempMarker(event.nativeEvent.coordinate)}
                        initialRegion={props.location && {...props.location, latitudeDelta:0.01, longitudeDelta:0.01}}
                        

                    >
                        {/* prioritize the temp marker (ie the marker that exists if the user has changed the location while this modal is open) */}
                        {tempMarker || props.location ?
                            <Marker
                                coordinate={tempMarker ?? props.location ?? /*make ts happy*/ {latitude:0, longitude:0}}
                                pinColor={colors.primary}
                            >
                                <Image
                                    source={require("../images/marker.png")}
                                    style={styles.marker}
                                />
                            </Marker>
                            :undefined
                        }
                    </MapView>
                    <Text style={styles.instructions}>Tap on the map to set the event location</Text>
                    <View style={styles.buttonRow}>
                        <LargeButton 
                            text='Cancel' 
                            style={styles.largeButton}
                            onPress={cancel}
                        />
                        <LargeButton 
                            text='OK' 
                            style={styles.largeButton}
                            active={!!props.location || !!tempMarker}
                            onPress={confirm}
                        />
                    </View>
                </View>
            </SafeAreaView>

        </Modal>
    </>


}

const styles = StyleSheet.create({
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.black,
        opacity: 0.5
    },
    windowContainer: {
        alignItems:"center",
        justifyContent: "center",
        flex:1,
        pointerEvents:'box-none'
    },
    window: {
        overflow:"hidden",
        width:"90%",
        height:"80%",
        backgroundColor:colors.white,
        borderRadius:5
    },
    mapView: {
        // maxWidth:"100%",
        flexGrow:1
    },
    instructions: {
        ...universalStyles.h2,
        paddingHorizontal:10,
        paddingTop:10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: "flex-end"
    },
    largeButton: {
        minWidth:100,
        marginRight:10,
        marginBottom: 10,
        marginTop:10
    },
    marker: {
        height: 50,
        width: 50,
        resizeMode: "contain",
        flex: 1
    }
})