import {Response} from 'express'
import {HandelErrors} from "../../errors/HandelErrors";
import IResponse from "../../interfaces/successResponse.interface";
import {sMessages} from "../constants/SMessages";


/**
 * @param {Response} res - its required
 * @return {Response} error - response an error object
 * @example {
 *       status: 'error',
 *      code: 1001,
 *     message: notfound
 *     }
 * */
export const sendError = (res: Response) => (e?) => {
    const error = new HandelErrors(e)
    return res.status(error.properError.statusCode).json({
        status: 'error',
        code: error.properError.code,
        message: error.properError.message
    })
}


/**
 * @param {Response} res - its required
 * @param {IResponse} detail - detail for sending message
 * @return {Response} object - response an object
 * */
export const success = (res: Response, detail?: IResponse) => (entity) => {
    if (!detail) detail = sMessages.DEFAULT
    if (entity || !detail.withData)
        return res.status(detail.statusCode).json({
            status: detail.statusCode,
            code: detail.code,
            message: detail.message,
            data: detail.withData ? entity : null
        })
    return sendError(res)()
}
