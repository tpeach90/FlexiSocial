import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/param_lists";
import { SafeAreaView, Text, TextInput, TouchableOpacity } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useDispatch } from "react-redux";
import { setUserToken } from "../../redux/actions";
// import { storage } from "../../storage/storage";


type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export const Welcome: React.FC<WelcomeScreenProps> = (props) => {


    const dispatch = useDispatch();

    async function login (email: string, password: string) {

        // contact the server and get a token back TODO
        const token = "test token";

        // update the redux store
        dispatch(setUserToken(token));

        // update the storage so the user stays signed in
        // setUserTokenInStore(token);
    }


    return <SafeAreaView>
        <Text>Email address</Text>
        <TextInput></TextInput>
        <Text>Password</Text>
        <TextInput></TextInput>
        <TouchableOpacity onPress={() => login("a@b.com", "password")}>
            <Text>Login</Text>
        </TouchableOpacity>
    </SafeAreaView>

}