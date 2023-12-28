import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/paramLists";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@apollo/client";
import { GET_USER } from "../../graphql/queries";



type UserScreen = NativeStackScreenProps<AppStackParamList, "UserScreen">;

export const UserScreen: React.FC<UserScreen> = ({route}) => {

    // get user data
    const { loading: userLoading, error: userError, data: userData } = useQuery(GET_USER, {
        variables: {
            id: route.params.id,
        },
    });

    console.log(userLoading, userError, userData); 

    if (userLoading) {
        return <Text>Loading</Text>
    }
    else if (userError) {
        return <Text>An error occurred. Please try again later.</Text>
    } 
    else if (userData) {
        return (
            <Text>User page.</Text>
        )
    }
    else {
        return <Text>An error occurred. Please try again later.</Text>
    }

}

const styles = StyleSheet.create({

})