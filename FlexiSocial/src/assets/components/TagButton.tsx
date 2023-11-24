import { Animated, Pressable, StyleSheet, Text, Touchable, TouchableOpacity, View, ViewStyle } from "react-native"
import { colors } from "../../config/config"
import { useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { faX, faXmark } from "@fortawesome/free-solid-svg-icons"


interface TagButtonProps {
    label: string
    // defaultValue?: boolean,
    enabled:boolean,
    onToggle?: () => any
    style?:ViewStyle | ViewStyle[]
}


/**
 * Button used to select "This Month" / "This Week" / etc in the map screen
 * @param props 
 * @returns 
 */
export default function TagButton(props: TagButtonProps) {

    // 0 when disabled, 1 when enabled.
    const anim = useRef(new Animated.Value(props.enabled ? 1 : 0)).current; // Initial value for opacity: 0

    // const [enabled, setEnabled] = useState(props.defaultValue ?? false);

    // const anim2 = Animated.multiply(anim)


    useEffect(() => {

        // start animation when "enabled" changes
        const myAnim = Animated.timing(anim, {
            toValue: props.enabled ? 1 : 0, // switch direction of animation if enabled/disabled
            duration: 100,
            useNativeDriver: true,
        });
        myAnim.start()
        
        // reset when enabled changes again
        return () => myAnim.stop()

    }, [anim, props.enabled]);


    function onToggle() {
        props.onToggle?.()
    }

    return (
        <Pressable
            onPress={onToggle}
            style={[props.style, { alignSelf: 'flex-start' }]}
        >
            
            <Animated.View
                style={[styles.button, {
                    backgroundColor: anim.interpolate({
                        inputRange:[0,1],
                        outputRange:[colors.white, colors.primary]
                    })
                }
            ]}
            >

                <Text style={[styles.labelText, props.enabled ? styles.labelTextEnabled : styles.labelTextDisabled]}>
                    {props.label}
                </Text>


                {/* X button */}
                <Animated.View 
                    style={[styles.xButton, 
                        {
                            opacity: anim
                        }
                    ]}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </Animated.View>


            </Animated.View>
    
        </Pressable>

    )
}

const styles = StyleSheet.create({

    button: {
        borderRadius: 15,
        flexDirection:"row",
        alignSelf: 'flex-start',
        padding:5,
        paddingLeft: 15
    },
    buttonEnabled: {
        backgroundColor: colors.primary
    },
    buttonDisabled: {
        backgroundColor: colors.white
    },

    labelText: {
        fontFamily: "Lalezar-Regular",
        marginRight:10
    },
    labelTextEnabled: {
        color: colors.white
    },
    labelTextDisabled: {
        color: colors.black
    },

    xButton: {
        backgroundColor: colors.white,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: "center", // horizontal
        justifyContent: "center" //vertical
    }
})