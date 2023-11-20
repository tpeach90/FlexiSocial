import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList} from "../../navigation/paramLists";
import { useDispatch, useSelector } from "react-redux";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";


type MapScreenProps = NativeStackScreenProps<AppStackParamList, "MapScreen">;

export const MapScreen: React.FC<MapScreenProps> = (props) => {

    const dispatch = useDispatch();

    

    return (
        <View style={styles.container}>
            {/*Render our MapView*/}
            <MapView
                style={styles.map}
                //specify our coordinates.
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            />
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