import { Animated, ReturnKeyTypeOptions, StyleSheet, Text, TextInput, View } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { colors, universalStyles } from "../../config/config";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";



interface EntryBoxProps {
    textInputProps?: TextInput["props"],
    valid?:boolean,
    message?:string,
    title?: string,
    style?:View["props"]["style"],
}


const EntryBox = React.forwardRef<TextInput, EntryBoxProps>((props, ref) => {

    // default values.
    props = {
        valid: true,
        ...props
    }

    const [messageVisible, setMessageVisible] = useState<boolean>(false);

    // animation to transition between validity state
    // 0 - normal color
    // 1 - invalid color
    const anim = useRef(new Animated.Value(0)).current;

    const firstUpdate = useRef(true);

    useEffect(() => {

        // prevents the animation when the page is first opened.
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return
        }

        const myAnim = Animated.timing(anim, {
            toValue: props.valid ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        });
        setMessageVisible(true);
        myAnim.start(() => {
            setMessageVisible(!props.valid);
        })

        return () => myAnim.stop()

    }, [anim, props.valid]);





    return (
        <View style={props.style}>

            {props.title 
                ? <Text style={styles.fieldTitle}>{props.title}</Text> 
                : undefined
            }

            <Shadow
                style={[{ width: "100%" }]}
                offset={[0, 2]}
                distance={3}
                startColor={"#CCC"}
                endColor={colors.white}
            >

                <Animated.View
                    style={[
                        styles.textInputWrapper,
                        {
                            backgroundColor: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [colors.light_gray, colors.invalid_light]
                            })
                        }
                    ]}
                >
                    <TextInput
                        {...props.textInputProps}
                        style={styles.textInput}
                        cursorColor={colors.primary}
                        spellCheck={false}
                        ref={ref}
                    />
                </Animated.View>
            </Shadow>


            {props.message && messageVisible
                ? <Animated.View style={[
                    styles.invalidMessageLine,
                    {
                        transform: [
                            {
                                translateY: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-30, 0]
                                })
                            }
                        ]
                    }
                ]}    
            >
                    <FontAwesomeIcon icon={faTriangleExclamation} style={styles.invalidIcon} />
                    <Text style={styles.invalidMessageText}>{props.message}</Text>
                </Animated.View>
                
                : undefined
            }

        </View>
    )
})


const styles = StyleSheet.create({

    textInputWrapper: {
        width: "100%",
        // backgroundColor: colors.light_gray,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    textInput: {
        padding: 0,
        ...universalStyles.p

    },
    fieldTitle: {
        ...universalStyles.h2,
        color: colors.gray,
        // marginTop: 20,
        marginBottom: 5,
        flexShrink: 1
    },
    invalid: {
        backgroundColor: colors.invalid_light
    },
    invalidMessageText: {
        ...universalStyles.p,
        color: colors.invalid_dark
    },
    invalidIcon: {
        color: colors.invalid_dark,
        marginRight: 5
    },
    invalidMessageLine: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
        zIndex:-1
    }
})

export default EntryBox;