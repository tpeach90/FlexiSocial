import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, Text, View } from "react-native";
import AuthStack from "./AuthStack";
import { useSelector } from "react-redux";
import AppStack from "./AppStack";
import DebugStack from "./DebugStack";
import { State } from "../redux/state";



export default function AppNav() {

    const screenStack = useSelector((state: State) => state.nonPersistent.screenStack);

    // display a loading icon
    if (screenStack == "loading") {
        return (
            <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <NavigationContainer>
            {
                // display the stack specified by the redux     
                screenStack == "app" ? <AppStack/> :
                screenStack == "auth" ? <AuthStack/> :
                screenStack == "debug" ? <DebugStack/>
                : undefined
            }
        </NavigationContainer>
    )
}