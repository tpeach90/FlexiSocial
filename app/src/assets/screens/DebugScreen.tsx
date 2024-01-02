import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList, DebugStackParamList } from "../../navigation/paramLists";
import { Alert, Image, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../../config/config";
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from "@react-navigation/native";
import EventInfo from "../components/EventInfo";
import EventFullInfoPanel from "../components/EventFullInfoPanel";
import UserTextRenderer from "../../utils/UserTextRenderer";
import { useQuery } from "@apollo/client";
import { GET_MY_ID } from "../../graphql/queries";
import { useState } from "react";
import { State } from "../../redux/state";



type DebugScreenProps = NativeStackScreenProps<DebugStackParamList, "DebugScreen">;

export const DebugScreen: React.FC<DebugScreenProps> = (props) => {

    const navigation = useNavigation<NativeStackNavigationProp<DebugStackParamList>>();

    const [jeff, setJeff] = useState<boolean>(false);



    const { loading, error, data } = useQuery(GET_MY_ID, {fetchPolicy: "no-cache"});
    const userToken = useSelector((state: State) => state.persistent.userToken);

    console.log(userToken)

    function goToMyUserPage() {
        if (loading) return Alert.alert("loading");
        if (error) return Alert.alert(error.message);
        if (!data.me) return Alert.alert("not signed in")
        navigation.navigate("UserScreen", {id: data.me.user.id})
    }

    console.log(loading, error, data);

    return (
        <View style={[StyleSheet.absoluteFillObject]}>

            {/* <UserTextRenderer>          
                The next part of this text should be displayed in *bold*. {"\n"}
                This should be _italics_. Hello. {"\n"}
                This is in *_bold_* and _*italics*_. {"\n"}
                This is a phone number: +441164960831 {"\n"}
                This is an email address: flexisocial046@notarealaddress.com {"\n"}
                This is a link to [Google](https://www.google.com/). {"\n"}
                These are other links with bare text: https://www.google.com google.com {"\n"}
                These are literal **stars** and __underscores__. {"\n"}
                This is a [hidden phone number](tel:+441164960831).

            </UserTextRenderer> */}

            <TouchableOpacity
                onPress={goToMyUserPage}
            >
                <View style={{backgroundColor: colors.primary}}>
                    <Text>View my user page.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setJeff(!jeff)} style={{backgroundColor:colors.secondary}}>
                <Text>toggle jeff</Text>
            </TouchableOpacity>
        </View>
    )

}

const styles = StyleSheet.create({

})