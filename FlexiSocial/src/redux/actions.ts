import { ScreenStackOptions } from "../utils/types";
import { Action } from "./reducer";



/**
 * Set the JWT token for the signed in user.
 * @param value 
 * @returns 
 */
export function setUserToken(value: string | null) : Action {
    return {
        type: "setUserToken",
        payload: {value}
    }
}

/**
 * Change the currently displaying screen stack.
 * @param value 
 * @returns 
 */
export function setScreenStack(value: ScreenStackOptions | null) : Action {
    return {
        type: "setScreenStack",
        payload: {value}
    }
}