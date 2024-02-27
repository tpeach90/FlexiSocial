import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DebugStackParamList } from "./paramLists";
import { DebugScreen } from "../assets/screens/DebugScreen";
import { UserScreen } from "../assets/screens/UserScreen";
import { CreateEventScreen } from "../assets/screens/CreateEventScreen";



export default function DebugStack(): JSX.Element {
    // create new stack for navigation - back button etc.
    const stack = createNativeStackNavigator<DebugStackParamList>();

    return (
        <stack.Navigator
            initialRouteName="DebugScreen"
            screenOptions={{ headerShown: false }}
        >
            <stack.Screen name="DebugScreen" component={DebugScreen} />
            <stack.Screen name="UserScreen" component={UserScreen} />
            <stack.Screen name="CreateEventScreen" component={CreateEventScreen} />
        </stack.Navigator>
    )
}
