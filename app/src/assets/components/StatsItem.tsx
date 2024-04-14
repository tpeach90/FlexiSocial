import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { ReactNode} from "react";
import { colors, universalStyles } from "../../config/config";

import { View, Text, StyleSheet } from "react-native";

interface StatsItemProps {
    children?: ReactNode;
    icon?: IconDefinition,
    style?: View["props"]["style"],
    theme?: "light" | "dark"
}


export default function StatsItem(props:StatsItemProps) {

    props = {
        theme: "light",
        ...props
    }

    return (
        <View style={[styles.statsItem, props.style]}>
            {props.icon && 
                <View style={{flexDirection:"row", alignItems:"center", alignSelf:"flex-start"}}>
                    <FontAwesomeIcon icon={props.icon} style={{ ...styles.statsItemIcon, ...(props.theme == "light" ? styles.statsItemIconLight : styles.statsItemIconDark) }} />
                    {/* this is just to align the icon. For this to work the height of the icon must be smaller than the height of a line of text*/}
                    <Text style={universalStyles.h2}/>
                </View>
            }
            
            <Text style={[styles.statsIconText, props.theme == "light" ? styles.statsIconTextLight : styles.statsIconTextDark]}>{props.children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    statsItem: {
        // flex: 1,
        flexDirection: "row",
        paddingVertical: 3,
        // flexShrink:1
    },
    statsItemIcon: {
        ...universalStyles.h2,
        marginRight: 5,
        // transform: [{ translateY: 0 }]
        alignContent:"center"
    },
    statsItemIconLight: {
        color:colors.primary
    },
    statsItemIconDark: {
        color: colors.white
    },
    statsIconText: {
        ...universalStyles.h2,
        flex: 1,
        marginLeft: 5,
        
    },
    statsIconTextLight: {
        color: colors.black
    },
    statsIconTextDark: {
        color: colors.white
    }
})