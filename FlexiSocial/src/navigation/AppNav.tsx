import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, Text, View } from "react-native";
import AuthStack from "./AuthStack";
import { useSelector } from "react-redux";
// import { State } from "../redux/reducer";
import AppStack from "./AppStack";
import { State } from "../redux/reducer";
import DebugStack from "./DebugStack";



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