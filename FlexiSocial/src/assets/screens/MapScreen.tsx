import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList} from "../../navigation/paramLists";
import { useDispatch, useSelector } from "react-redux";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { colors, googleMapsStyle } from "../../config/config";
import { SafeAreaView } from "react-native-safe-area-context";
import TagButton from "../components/TagButton";
import { setMapScreenToggle } from "../../redux/actions";
import MapScreenTagBar from "../components/MapScreenTagBar";
import EventInfo from "../components/EventInfo";
import EventFullInfoPanel from "../components/EventFullInfoPanel";


type MapScreenProps = NativeStackScreenProps<AppStackParamList, "MapScreen">;

export const MapScreen: React.FC<MapScreenProps> = (props) => {


    

    return (
        <View style={styles.container}>
            {/*Render our MapView*/}
            <MapView
                style={styles.map}
                //specify our coordinates.
                // initialRegion={{
                //     latitude: 37.78825,
                //     longitude: -122.4324,
                //     latitudeDelta: 0.0922,
                //     longitudeDelta: 0.0421,
                // }}
                customMapStyle={googleMapsStyle}
            >
                <Marker 
                    coordinate={{ latitude:52.787696579248234, longitude: -0.1533563650942924}}
                    pinColor={colors.primary}
                    // add a custom marker here!!
                    // image={require("../../assets/images/ADD_MARKER_HERE_TODO.png")}
                />
            </MapView>



            <SafeAreaView 
                pointerEvents="box-none" // allows users to interact with the map behind this view.
                style={StyleSheet.absoluteFillObject}
            >   
                <MapScreenTagBar/>

                <View style={StyleSheet.absoluteFillObject}>
                    <EventFullInfoPanel eventId={1}/>
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