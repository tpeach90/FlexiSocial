
export type AuthStackParamList = {
    Welcome: undefined,
    Login: undefined,
    CreateAccountScreen: undefined,
    LoginScreen: undefined
}

export type AppStackParamList = {
    AppTabNavigator: undefined,
    UserScreen: {
        id: number
    },
    CreateEventScreen: undefined
}

export type AppTabNavigatorParamList = {
    MapScreen: undefined,
    EventsScreen: undefined,
    MessagesScreen:undefined,
    OptionsScreen:undefined,
}

export type DebugStackParamList = {
    DebugScreen: undefined,
    UserScreen: {
        id: number
    },
    CreateEventScreen: undefined

}