import {IErrorPropertys} from "../interfaces/errorMessages.interface";
import {StatusCodes} from "http-status-codes";

export default class ServerError extends Error {
    code
    statusCode
    constructor(message: IErrorPropertys) {
        if (!message.statusCode) message.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
        super(message.message)
        this.statusCode = message.statusCode
        this.code = message.code || 2000
    }
}

