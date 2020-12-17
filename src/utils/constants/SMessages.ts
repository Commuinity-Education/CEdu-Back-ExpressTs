import { StatusCodes } from 'http-status-codes'


export const sMessages = {
    DEFAULT: {
        message: 'ok',
        code: 3000,
        statusCode: StatusCodes.OK,
        withData: true
    },
    UPDATE_AUTH_OK: {
        message: 'update was successful',
        code: 3001,
        statusCode: StatusCodes.CREATED,
        withData: false
    },
    USER_CREATED: {
        message: 'User crated Successfully',
        code: 3002,
        statusCode: StatusCodes.CREATED,
        withData: true
    },
    DELETE_OK: {
        message: 'Deletion was successful',
        code: 3004,
        statusCode: StatusCodes.OK,
        withData: false
    },
    IS_SUBSCRIBE: {
        message: 'YOU AR  subscribe channel successfully',
        code: 3005,
        statusCode: StatusCodes.CREATED,
        withData: false
    },
    REQUEST_SEND_OK: {
        message: 'Request send successfully',
        code: 3006,
        statusCode: StatusCodes.OK,
        withData: false
    },
    ACCEPT_REQUEST:{
        message: 'Request Accepted',
        code: 3007,
        statusCode: StatusCodes.OK,
        withData: false
    },
    REJECT_REQUEST:{
        message: 'Request Rejected',
        code: 3008,
        statusCode: StatusCodes.OK,
        withData: false
    },
    UNSUBSCRIBE:{
        message: 'User Unsubscribed',
        code: 3009,
        statusCode: StatusCodes.OK,
        withData: false
    }


}

export const systemMessages = {
    default: (e: Error) => {
        return {
            code: 2001,
            statusCode: 100,
            message: e.message
        }
    },
}
