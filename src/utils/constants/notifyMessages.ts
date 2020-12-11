import * as _ from 'lodash'

export const notifyMessage = {
    /**
     * message for accept channel or group request
     * @param {string} username - person accept the request like owner of channel username
     * @param {string} typeTitle - title of channel or group
     * @param {string} type - type of request channel or group
     * @return {string} message with accepted person username and channel or group title
     * @example @foo Accept your request for Physics's Channel
     * */
    CHANNEL_OR_GROUP_ACCEPT: (username: string, typeTitle: string, type: string) => {
        return `@${username} Accept your request for ${_.startCase(typeTitle)}'s ${_.startCase(type)}`
    }
}