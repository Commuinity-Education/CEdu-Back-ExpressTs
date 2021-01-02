import ServerError from "../errors/serverError"
import {Request, Response} from 'express'
import config from "../configs/config";
import {eMessages} from "../utils/constants/eMessages";
import {HandelErrors} from "../errors/HandelErrors";

export const notFoundPage = (req: Request, res: Response, next) => {

    next(new ServerError(eMessages.ROUTE_NOT_FOUND(req.method,req.path)))
}

export const errorHandler = async (error, req, res, next) => {
    const e = new HandelErrors(error)
    return res.status(e.properError.statusCode).json({
        status: 'error',
        code: e.properError.code,
        message: e.properError.message
    })
}
