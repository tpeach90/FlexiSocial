
export type AuthStackParamList = {
    Welcome: undefined,
    Login: undefined,
    CreateAccountScreen: undefined,
    LoginScreen: undefined
}

export type AppStackParamList = {
    MapScreen: undefined,
    UserScreen: {
        id: number
    }
}

export type DebugStackParamList = {
    DebugScreen: undefined,
    UserScreen: {
        id: number
    }
}