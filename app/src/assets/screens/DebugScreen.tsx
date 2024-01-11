import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList, DebugStackParamList } from "../../navigation/paramLists";
import { Alert, Animated, Image, PanResponder, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../../config/config";
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from "@react-navigation/native";
import EventInfo from "../components/EventInfo";
import EventFullInfoPanel from "../components/EventFullInfoPanel";
import UserTextRenderer from "../../utils/UserTextRenderer";
import { useQuery } from "@apollo/client";
import { GET_MY_ID } from "../../graphql/queries";
import { useRef, useState } from "react";
import { State } from "../../redux/state";



type DebugScreenProps = NativeStackScreenProps<DebugStackParamList, "DebugScreen">;

export const DebugScreen: React.FC<DebugScreenProps> = (props) => {

    const navigation = useNavigation<NativeStackNavigationProp<DebugStackParamList>>();

    const { loading, error, data } = useQuery(GET_MY_ID, {fetchPolicy: "no-cache"});
    const userToken = useSelector((state: State) => state.persistent.userToken);


    const menuPan = useRef(new Animated.Value(0)).current;
    const menuPanResponder = useRef(PanResponder.create({
        onMoveShouldSetPanResponder: (event, gestureState) => {
            event.stopPropagation();
            return true;
        },
        // map dx directly to the animated variable.
        onPanResponderMove: (event, gestureState) =>  {
            event.stopPropagation();
            menuPan.setValue(gestureState.dy)
            console.log(gestureState.dy)
        },
        onShouldBlockNativeResponder: () => true,
        onStartShouldSetPanResponderCapture: (e, gestureState) => true,
        // onPanResponderStart: (event, gestureState) => event.stopPropagation(),
        // onPanResponderEnd: (event, gestureState) => event.stopPropagation(),
        onStartShouldSetPanResponder: () => false,
        // onStartShouldSetPanResponderCapture: () => false,
        // onMoveShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: () => false,
    })).current;

    console.log(userToken)

    function goToMyUserPage() {
        if (loading) return Alert.alert("loading");
        if (error) return Alert.alert(error.message);
        if (!data.me) return Alert.alert("not signed in")
        navigation.navigate("UserScreen", {id: data.me.user.id})
    }

    // console.log(loading, error, data);

    return (
        // <View style={[StyleSheet.absoluteFillObject]}>

            <Animated.ScrollView
                style={[StyleSheet.absoluteFillObject, {
                    transform: [{ translateY: menuPan }],
                    // width: "100%",
                    // height: "100%",
                }]}
                {...menuPanResponder.panHandlers}
            >
                <Text>{"a\n".repeat(100)}</Text>
            </Animated.ScrollView>

        // </View>
    )

}

const styles = StyleSheet.create({

})