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
import { Dispatch, useRef, useState } from "react";
import { State } from "../../redux/state";
import SideMenu from "react-native-side-menu-updated";
import { Action } from "../../redux/reducer";
import { client } from "../../utils/apolloClientConfig";



type DebugScreenProps = NativeStackScreenProps<DebugStackParamList, "DebugScreen">;

export const DebugScreen: React.FC<DebugScreenProps> = (props) => {

    const navigation = useNavigation<NativeStackNavigationProp<DebugStackParamList>>();


    const { loading, error, data } = useQuery(GET_MY_ID, {fetchPolicy: "no-cache"});
    const userToken = useSelector((state: State) => state.persistent.userToken);

    const [sideMenuOpen, setSideMenuOpen ] = useState<boolean>(false);

    const [newUserToken, setNewUserToken] = useState<string>("");

    const dispatch = useDispatch();



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

        <>
            {/* ignore the intellisense error - It seems to work fine. 
            Possibly caused by me using react-native-side-menu-updated with the old non updated type declarations module.*/}
            {/* @ts-ignore */}
            <SideMenu
                isOpen={sideMenuOpen}
                // hiddenMenuOffset={100}
                menu={(
                    <View style={{backgroundColor: "#F00"}}>
                        <Text>This is the side menu.</Text>
                    </View>
                )}
                onChange={(isOpen) => setSideMenuOpen(isOpen)}
                
            >  
                <View style={{backgroundColor:"#FFF"}}>
                    <Text>This is the content.</Text>
                    <Text>The current user token is {userToken}</Text>
                    <TouchableOpacity onPress={goToMyUserPage}>
                        <Text>Go to my user page</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("CreateEventScreen")}>
                        <Text>Go to the create event page</Text>
                    </TouchableOpacity>
                    
                    <TextInput value={newUserToken} onChangeText={(value) => setNewUserToken(value)}></TextInput>
                    <Text onPress={() => dispatch<Action>({type:"setUserToken", payload:{value:newUserToken}})}>Set the usertoken</Text>
                    <Text onPress={() => client.clearStore()}>Clear the apollo client cache</Text>
                </View>

            </SideMenu>

        </>
    )

}

const styles = StyleSheet.create({

})