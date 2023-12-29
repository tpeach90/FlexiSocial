import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList, DebugStackParamList } from "../../navigation/paramLists";
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { colors } from "../../config/config";
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from "@react-navigation/native";
import EventInfo from "../components/EventInfo";
import EventFullInfoPanel from "../components/EventFullInfoPanel";
import UserTextRenderer from "../../utils/UserTextRenderer";



type DebugScreenProps = NativeStackScreenProps<DebugStackParamList, "DebugScreen">;

export const DebugScreen: React.FC<DebugScreenProps> = (props) => {

    const navigation = useNavigation<NativeStackNavigationProp<DebugStackParamList>>();


    return (
        <View style={[StyleSheet.absoluteFillObject]}>

            <UserTextRenderer>          
                The next part of this text should be displayed in *bold*. {"\n"}
                This should be _italics_. Hello. {"\n"}
                This is in *_bold_* and _*italics*_. {"\n"}
                This is a phone number: +441164960831 {"\n"}
                This is an email address: flexisocial046@notarealaddress.com {"\n"}
                This is a link to [Google](https://www.google.com/). {"\n"}
                These are other links with bare text: https://www.google.com google.com {"\n"}
                These are literal **stars** and __underscores__. {"\n"}
                This is a [hidden phone number](tel:+441164960831).

            </UserTextRenderer>
        </View>
    )

}

const styles = StyleSheet.create({

})