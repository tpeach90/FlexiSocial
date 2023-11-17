import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./param_lists";
import { Welcome } from "../assets/screens/Welcome";


export default function AuthStack() : React.JSX.Element {

    // create new stack for navigation - back button etc.
    const stack = createNativeStackNavigator<AuthStackParamList>();
    
    return (
        <stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{ headerShown: false }}
        >
            <stack.Screen name="Welcome" component={Welcome} />
        </stack.Navigator>
    )
    
}