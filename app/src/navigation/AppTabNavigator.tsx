

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AppStack from './MapStack';
import { Alert, Animated, Image, PanResponder, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppTabNavigatorParamList } from './paramLists';
import { colors, fonts, universalStyles } from '../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars, faCalendarDays, faMapLocation, faMapLocationDot, faMessage } from '@fortawesome/free-solid-svg-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import MapScreen from '../assets/screens/MapScreen';

export default function AppTabNavigator() {

    const Tab = createBottomTabNavigator <AppTabNavigatorParamList>();

    // const getTabBarVisibility = (route) => {
    //     const routeName = getFocusedRouteNameFromRoute(route);
    //     // const hideOnScreens = [SCREENS.REVIEW_ORDER, SCREENS.ORDER_PAYMENT]; // put here name of screen where you want to hide tabBar
    //     // return hideOnScreens.indexOf(routeName) <= -1;
    // };

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarBackground: () => <View style={styles.tabBarBackground}/>,
                tabBarActiveTintColor:colors.white,
                tabBarInactiveTintColor:colors.gray,
                tabBarBadgeStyle:{backgroundColor:colors.notification, color:colors.white, fontWeight:'bold'},
                tabBarLabelStyle:{fontFamily:fonts.primary.bold, fontSize:12},
                tabBarHideOnKeyboard:true,
                tabBarStyle: {display: "flex"}
            }}
            initialRouteName="MapScreen"
            
        >
            <Tab.Screen 
                name="MapScreen" 
                component={MapScreen}  
                options={({route}) => ({
                    tabBarIcon:({color}) => <FontAwesomeIcon icon={faMapLocationDot} color={color} size={20}/>,
                    // tabBarBadge:"Map"
                    tabBarLabel:"Map",
                })}
            />
            <Tab.Screen
                name="EventsScreen"
                component={View}
                options={{
                    tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faCalendarDays} color={color} size={20} />,
                    tabBarBadge:"3",
                    tabBarLabel: "Events"
                }}
            />
            <Tab.Screen
                name="MessagesScreen"
                component={View}
                options={{
                    tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faMessage} color={color} size={20} />,
                    tabBarBadge:"6",
                    tabBarLabel: "Messages"
                }}
            />
            <Tab.Screen
                name="OptionsScreen"
                component={View}
                options={{
                    tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faBars} color={color} size={20} />,
                    tabBarLabel: "Options"
                }}
            />
       </Tab.Navigator>
    );
}


const styles = StyleSheet.create({
    tabBarBackground: {
        backgroundColor:colors.primary,
        ...StyleSheet.absoluteFillObject
    },
    iconStyle: {
        flex:1
    }
})