import { Animated, ReturnKeyTypeOptions, StyleSheet, Text, TextInput, View } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { colors, universalStyles } from "../../config/config";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faL, faTriangleExclamation, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaFrame } from "react-native-safe-area-context";



interface EntryBoxProps {
    defaultValue?: string,
    value?: string,
    onChangeValue?: (newValue: string) => any,
    textInputProps?: TextInput["props"],
    valid?:boolean,
    message?:string,
    title?: string,
    style?:View["props"]["style"],
    boxStyle?: View["props"]["style"],
    icon?: IconDefinition,
    children?: React.ReactNode,
    /**
     * Normally errors are not shown if the user has not interacted with an entry box yet, even if the current value is invaid.
     * 
     * This props overides this behavior and displays error messages no matter what.
     * @default false
     */
    forceDisplayErrors?: boolean,
    /**
     * Sanitizes user inputs as they type.
     * 
     * Called after each edit to the entry box, but before the validator (if provided).
     */
    coercer?: (value: string) => string,
    /**
     * Overrides the message & valid props. This function is called on each change and will display the returned string as an error message.
     * 
     * If no value is returned then the string is taken to be valid. 
     */
    validator?: (value:string) => string | undefined,
    /**
     * Called if the result of the validator function caused validity to change.
     */
    onChangeValid?: (valid:boolean) => any,
    /**
     * Called if the result of the validator function caused the error message to change.
     */
    onChangeMessage?: (message:string|undefined) => any,
    /**
     * The type of entry box used. Default is `"text-input"`. `"box-only"` displays the color-changing view around the component's children, but does not contain the text input.
     */
    display?: "text-input" | "box-only" | "none"
}

/**
 * An entry box for a form. Has optional field title, FontAwesomeIcon, and error messages.
 */
const EntryBox = React.forwardRef<TextInput, EntryBoxProps>((props, ref) => {

    // default values.
    props = {
        valid: true,
        display: "text-input",
        forceDisplayErrors: false,
        ...props
    }

    // override props if the validator is in use
    const [message, setMessage] = useState<string | undefined>(props.validator?.(props.defaultValue ?? ""));
    const [valid, setValid] = useState<boolean>(!props.validator?.(props.defaultValue ?? ""));
    if (props.validator) {
        props = {
            ...props,
            valid,
            message,
            display: "text-input",
        }
    }

    // value displayed in the text input, if it is being used.
    const [value, setValue] = useState(props.defaultValue ?? "");
    // overided by props.value
    if (props.value && props.value != value) {
        setValue(props.value);
    }

    // this is the message that is actualy displayed
    // if props.message is set to undefined then this stays the same
    // so that the animation can play correctly and the message doesn't just disappear.
    const [displayedMessage, setDisplayedMessage] = useState<string>("");

    // different to !props.valid in that this is true when any part of the message is on the screen
    // eg if valid has just been set to true then messageVisible is still true while the error message disappears via the animation
    const [messageVisible, setMessageVisible] = useState<boolean>(false);

    // animation to transition between validity state
    // 0 - valid
    // 1 - invalid
    const anim = useRef(new Animated.Value(0)).current;

    const firstUpdate = useRef(true);

    // animation of the box changing color and the error message appearing
    useEffect(() => {

        // prevents the animation when the page is first opened.
        if (firstUpdate.current) {
            firstUpdate.current = false;
            if (!props.forceDisplayErrors)
                return
        }

        const myAnim = Animated.timing(anim, {
            toValue: props.valid ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        });

        // in the case that:
        // 1. props.valid is changing from false to true, and
        // 2. messageVisible is false
        // we need to prevent the message becoming visible because it just makes the UI jump a bit with no error appearing.
        // this happens when the EntryBox is first rendered, valid starts as false, and forceDisplayErrors is false
        // therefore I ONLY set messageVisible to true if it is changing from valid to invalid
        // In all cases where valid is changing from false to true other to that above, the error message will already be visible.
        if (!props.valid)
            setMessageVisible(true);

        myAnim.start(() => {
            setMessageVisible(!props.valid);
        })

        return () => myAnim.stop()

    }, [anim, props.valid, props.forceDisplayErrors]);

    // saves the text of the error message when it is set to undefined
    // To prevent it just disappearing - It should slide out
    if (props.message && props.message != displayedMessage) {
        setDisplayedMessage(props.message);
    }



    function onChangeText(text: string) {

        // run coercer function if specified
        let newValue = text;
        if (props.coercer) {
            newValue = props.coercer(newValue);
        }
        setValue(newValue);

        // call the onChangeText function that may have been provided by the parent compoent and was overidden here
        props.textInputProps?.onChangeText?.(newValue);

        // validate
        if (props.validator) {
            const newMessage = props.validator(newValue);
            // check if message changed.
            if (newMessage != message) {
                setMessage(newMessage)
                props.onChangeMessage?.(newMessage);

                // check if validity changed
                if (!newMessage != !message) {
                    setValid(!newMessage)
                    props.onChangeValid?.(!newMessage);
                }
            }
        }

        props.onChangeValue?.(newValue);
        
    }


    return (
        <View style={props.style}>

            <View style={styles.fieldTitleBar}>
                {props.icon
                    ? <FontAwesomeIcon icon={props.icon} style={styles.icon} />
                    : undefined
                }
                {props.title
                    ? <Text style={styles.fieldTitle}>{props.title}</Text>
                    : undefined
                }
            </View>

            {props.display == "text-input" || props.display == "box-only"
                ? <Shadow
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
                            },
                            props.boxStyle
                        ]}
                    >
                        {props.display == "text-input"
                            ? <TextInput
                                {...props.textInputProps}
                                style={[styles.textInput, props.textInputProps?.style]}
                                cursorColor={colors.primary}
                                ref={ref}
                                onChangeText={onChangeText}
                                value={value}
                            />
                            : undefined
                        }
                        {props.children}
                    </Animated.View>
                </Shadow>
                :undefined
            }
            

            {props.display == "none" ? props.children : undefined}


            {messageVisible
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
                    <Text style={styles.invalidMessageText}>{displayedMessage}</Text>
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
    fieldTitleBar: {
        flexDirection: "row",
        alignContent: "center"
    },
    icon: {
        color: colors.primary,
        marginLeft: 3,
        marginRight: 7,
        transform: [{ translateY: 4 }]
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
        color: colors.invalid_dark,
        flexWrap:"wrap",
        flexShrink:1
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
    },

})

export default EntryBox;