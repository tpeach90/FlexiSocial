import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/paramLists";
import { SafeAreaView, Text, TextInput, TouchableOpacity } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { setUserToken } from "../../redux/actions";
import { State } from "../../redux/reducer";
import endpoints from "../../utils/endpoints";
// import { storage } from "../../storage/storage";


type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, "Login">;

export const Login: React.FC<LoginScreenProps> = (props) => {

    const userToken = useSelector((state: State) => state.persistent.userToken)


    const dispatch = useDispatch();

    async function login(email: string, password: string) {

        // contact the server and get a token back TODO
        // const token = "new token";
        const {userInfo, token} = await endpoints.login(email, password);

        // update the redux store
        dispatch(setUserToken(token));
    }


    return <SafeAreaView>
        <Text>The current user token is {userToken}</Text>
        <Text>Email address</Text>
        <TextInput></TextInput>
        <Text>Password</Text>
        <TextInput></TextInput>
        <TouchableOpacity onPress={() => login("a@b.com", "password")}>
            <Text>Login</Text>
        </TouchableOpacity>
    </SafeAreaView>

}