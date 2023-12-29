

import React from 'react';
import { Linking, StyleSheet, ViewStyle } from 'react-native';
import ParsedText from 'react-native-parsed-text';
import { colors, fonts, universalStyles } from '../config/config';


const bracketedURLPattern = /\[(.*)\]\((.*)\)/;

interface UserTextRendererProps {
    children: string | string[],
    style?: ViewStyle | ViewStyle[]
}

export default function UserTextRenderer(props: UserTextRendererProps) {

    function handleUrlPress(url: string, matchIndex : number) {
        Linking.openURL(url);
    }

    function handleBracketedURLPress(matched: string, matchIndex : number) {
        // parse the string again (might not have to do this but I haven't worked out how.)
        const match = matched.match(bracketedURLPattern);
        // should always be true because this has already been matched once
        if (match) {
            handleUrlPress(match[2], matchIndex)
        } else {
            throw new Error("handleBracketedURLPress pattern not matching the incoming string. This should never happen, there must be a bug in the code somewhere.")
        }
    }

    function handlePhonePress(phone: string, matchIndex: number) {
        Linking.openURL("tel:" + phone);
    }

    function handleEmailPress(email: string, matchIndex: number) {
        Linking.openURL("mailto:" + email);
    }

    return (
        <ParsedText
            style={[styles.text, props.style]}
            parse={
                [
                    // link with brackets
                    { pattern: bracketedURLPattern, style: styles.link, renderText: (_, matches) => matches[1], onPress: handleBracketedURLPress },
                    // default matches
                    { type: 'url', style: styles.underlinedLink, onPress: handleUrlPress },
                    { type: 'phone', style: styles.underlinedLink, onPress: handlePhonePress },
                    { type: 'email', style: styles.underlinedLink, onPress: handleEmailPress },
                    // literal *
                    { pattern: /\*\*/, style: styles.text, renderText: () => "*" },
                    // literal _
                    { pattern: /__/, style: styles.text, renderText: () => "_" },
                    // bold and italic
                    { pattern: /\*_([^\*_]+)_\*/, style: styles.boldItalics, renderText: (_, matches) => matches[1] },
                    { pattern: /_\*([^\*_]+)\*_/, style: styles.boldItalics, renderText: (_, matches) => matches[1] },
                    // bold
                    { pattern: /\*([^\*_]+)\*/, style: styles.bold, renderText: (_, matches) => matches[1] },
                    // italics
                    { pattern: /_([^\*_]+)_/, style: styles.italics, renderText: (_, matches) => matches[1] },
                ]
            }
            childrenProps={{ allowFontScaling: false }}
        >
            {Array.isArray(props.children) ? props.children.join("") : props.children}
        </ParsedText>
    );
} 


const styles = StyleSheet.create({

    link: {
        color: colors.primary,
        fontFamily: fonts.primary.bold
    },

    underlinedLink: {
        color: colors.primary,
        fontFamily: fonts.primary.bold,
        textDecorationLine: 'underline',
        textDecorationColor:colors.primary,
        textDecorationStyle: 'dashed'
    },

    text: {
        ...universalStyles.p,
    },

    boldItalics: {
        fontStyle: 'italic',
        fontWeight: "bold"
    },
    
    bold: {
        fontFamily: fonts.primary.bold
    },

    italics: {
        fontStyle: 'italic'
    }

});