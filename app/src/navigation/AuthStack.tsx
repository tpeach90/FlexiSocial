import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./paramLists";
import { Welcome } from "../assets/screens/Welcome";
import { Login } from "../assets/screens/Login";
import { CreateAccountScreen } from "../assets/screens/CreateAccountScreen";


export default function AuthStack() : React.JSX.Element {

    // create new stack for navigation - back button etc.
    const stack = createNativeStackNavigator<AuthStackParamList>();
    
    return (
        <stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{ headerShown: false }}
        >
            <stack.Screen name="Welcome" component={Welcome} />
            <stack.Screen name="Login" component={Login} />
            <stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} />
        </stack.Navigator>
    )
    
}