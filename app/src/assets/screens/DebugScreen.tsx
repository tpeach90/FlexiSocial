import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList, DebugStackParamList } from "../../navigation/paramLists";
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { colors } from "../../config/config";
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from "@react-navigation/native";
import EventInfo from "../components/EventInfo";
import EventFullInfoPanel from "../components/EventFullInfoPanel";



type DebugScreenProps = NativeStackScreenProps<DebugStackParamList, "DebugScreen">;

export const DebugScreen: React.FC<DebugScreenProps> = (props) => {

    const navigation = useNavigation<NativeStackNavigationProp<DebugStackParamList>>();


    return (
        <View style={[StyleSheet.absoluteFillObject, {backgroundColor:colors.secondary}]}>

            <EventFullInfoPanel
                eventId={1}
            />
        </View>
    )

}

const styles = StyleSheet.create({

})