import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, Text, View } from "react-native";
import AuthStack from "./AuthStack";
import { useSelector } from "react-redux";
import AppStack from "./AppStack";
import DebugStack from "./DebugStack";
import { State } from "../redux/state";
import LoadingModal from "../assets/components/LoadingModal";



export default function AppNav() {

    const screenStack = useSelector((state: State) => state.nonPersistent.screenStack);
    const isLoading = useSelector((state: State) => state.nonPersistent.isLoading);


    // display a loading icon
    if (screenStack == "loading") {
        return <LoadingModal visible={true}/>
    }

    return (<>
        <LoadingModal visible={isLoading} />
        <NavigationContainer>
            {(() => {
                switch (screenStack) {
                    case "app": return <AppStack/>
                    case "auth": return <AuthStack/>
                    case "debug": return <DebugStack/>
            }})()}
        </NavigationContainer>
    </>)
}