import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppStackParamList as AppStackParamList } from "./paramLists";
import { UserScreen } from "../assets/screens/UserScreen";
import { CreateEventScreen } from "../assets/screens/CreateEventScreen";
import AppTabNavigator from "./AppTabNavigator";



export default function AppStack(): JSX.Element {

    // create new stack for navigation - back button etc.
    const stack = createNativeStackNavigator<AppStackParamList>();

    return (
        <stack.Navigator
            initialRouteName="AppTabNavigator"
            screenOptions={{ headerShown: false }}
        >
            <stack.Screen name="AppTabNavigator" component={AppTabNavigator} />
            <stack.Screen name="UserScreen" component={UserScreen} />
            <stack.Screen name="CreateEventScreen" component={CreateEventScreen} />
        </stack.Navigator>
    )
}
