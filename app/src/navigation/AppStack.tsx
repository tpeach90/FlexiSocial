import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppStackParamList } from "./paramLists";
import { MapScreen } from "../assets/screens/MapScreen";



export default function AppStack(): JSX.Element {

    // create new stack for navigation - back button etc.
    const stack = createNativeStackNavigator<AppStackParamList>();

    return (
        <stack.Navigator
            initialRouteName="MapScreen"
            screenOptions={{ headerShown: false }}
        >
            <stack.Screen name="MapScreen" component={MapScreen} />
        </stack.Navigator>
    )
}