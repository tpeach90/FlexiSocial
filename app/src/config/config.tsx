import { StyleSheet } from "react-native"


export const backendURL = "http://localhost:4000/graphql"

export const colors = {
    black : "#000",
    white: "#FFF",
    gray: "#BCBDC0",
    light_gray: "#EBEBEB",
    primary: "#6963BD",
    secondary: "#72E060",
    tertiary: "#FFB169",
    background: "#FFF",
    invalid_light: "#FFD8B4",
    invalid_dark: "#FF7A00",
}

export const fonts = {
    primary: {
        bold: "EncodeSansSemiCondensed-Bold",
        regular: "EncodeSansSemiCondensed-Regular"
    },
    secondary: {
        regular: "Lalezar-Regular"
    },
    tertiary: {
        regular: "KronaOne-Regular"
    }
}



export const universalStyles = StyleSheet.create({
    screenHeaderText: {
        fontFamily: fonts.primary.bold,
        fontSize:30,
        color:colors.white
    },
    h1: {
        fontFamily: fonts.primary.bold,
        fontSize:18,
        color:colors.black
    },
    h2: {
        fontFamily: fonts.primary.bold,
        fontSize: 14,
        color:colors.black
    },
    p: {
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        color: colors.black
    }
})


// to create this use https://mapstyle.withgoogle.com/
export const googleMapsStyle = [
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#9C96F0"
            }
        ]
    }
]