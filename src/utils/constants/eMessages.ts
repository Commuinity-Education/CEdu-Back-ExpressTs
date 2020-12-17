import {StatusCodes} from "http-status-codes";
import {DatabaseError, ValidationError} from "sequelize";

export const eMessages = {
    USERNAME_NOT_PROVIDED: {
        message: 'username Not Provided',
        code: 1000,
        statusCode: StatusCodes.BAD_REQUEST
    },
    NOT_FOUND: {
        message: 'Not found',
        code: 1001,
        statusCode: StatusCodes.NOT_FOUND
    },
    ROUTE_NOT_FOUND: (dist) => {
        return {
            message: `you want to go ${dist} but this distination Dosnot exist`,
            code: 1002,
            statusCode: StatusCodes.BAD_REQUEST
        }
    },
    UNAUTHORIZED: {
        message: 'You have not access to this part',
        code: 1003,
        statusCode: StatusCodes.UNAUTHORIZED
    },
    MIME_TYPE_NOT_PROVIDE: {
        message: 'please provide mimetype object for your request',
        code: 1004,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    },
    REQUEIRD: (item) => {
        return {
            message: `${item} Is Required`,
            statusCode: StatusCodes.BAD_REQUEST,
            code: 1005
        }
    },
    USER_EXIST: {
        message: 'This User Name Or Email already exist',
        statusCode: StatusCodes.BAD_REQUEST,
        code: 1006
    },
    FILE_TYPE_NOT_ACCEPTABLE: {
        message: 'This file type can not Acceptable',
        statusCode: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
        code: 1007
    },
    WRONG_USER_OR_PASS: {
        message: 'Username or Password is wrong',
        statusCode: StatusCodes.UNAUTHORIZED,
        code: 1008
    },
    VALIDATE_JOI: (e: Error) => {
        return {
            message: e.message,
            statusCode: StatusCodes.BAD_REQUEST,
            code: 1009
        }
    },
    UPDATE_UNABLE:{
        message: 'unable to update',
        statusCode: StatusCodes.BAD_REQUEST,
        code: 1010
    },
    DELETE_UNABLE:{
        message: 'unable to delete',
        statusCode: StatusCodes.BAD_REQUEST,
        code: 1011
    },
    SUBSCRIBED_BEFORE:{
        message: 'you ahve already subscribe this channel before',
        statusCode: StatusCodes.BAD_REQUEST,
        code: 1012
    },
    REQUEST_EXIST: {
        message: 'you already send request',
        code: 1013,
        statusCode: StatusCodes.BAD_REQUEST
    },
    UUID_NOT_VALID: {
        message: 'UUID is not valid',
        code: 1014,
        statusCode: StatusCodes.BAD_REQUEST
    },
    STATUS_CANT_CHANGE: {
        message: 'you cant change request status twice plz ask for request again',
        code: 1015,
        statusCode: StatusCodes.BAD_REQUEST
    }


}

export const systemErrorMessages = {
    default: (e) => {
        console.log(e.code)
        return {
            code: 2001,
            statusCode: e.code ? e.code : StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        }
    },
    sequlizeValidationError: (e: ValidationError) => {
        return {
            code: 2002,
            statusCode: StatusCodes.BAD_REQUEST,
            message: e.errors[0].message
        }
    },
    dbError: (e: DatabaseError) => {
        return {
            code: 2003,
            statusCode: StatusCodes.BAD_REQUEST,
            message: e.message
        }
    },
    serverError: (e) => {
        return {
            code: e.code || 2000,
            statusCode: e.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        }
    },

}
