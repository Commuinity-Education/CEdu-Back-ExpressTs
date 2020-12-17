import JoiValidator from "../../../../../utils/validators/joi";
import {NextFunction, Request, Response} from "express";
import Requests from "../../../../../models/Requests.model";
import {REQUEST_STATUS} from "../../../../../Constants";
import ServerError from "../../../../../errors/serverError";
import {eMessages} from "../../../../../utils/constants/eMessages";
import {sendError} from "../../../../../utils/helpers/response";

export class RequestsMiddleware {
    acceptOrReject(req: Request, res: Response, next: NextFunction) {
        const joi = new JoiValidator()
        req.body = joi.acceptOrRejectRequestBody(req.body)
        req.params = joi.acceptOrRejectRequestParam(req.params)
        next()
    }

    canChangeStatus({body, user}: Request, res: Response, next: NextFunction) {
        Requests.findOne({
            where: {
                userId: user['id'],
                requesterId: body.requesterId,
                typeOfRequest: body.typeOfRequest,
                typeId: body.typeId,
                typeName: body.typeName,
                status: REQUEST_STATUS.pending
            }
        }).then(req => {
            if (!req) throw new ServerError(eMessages.STATUS_CANT_CHANGE)
            next()
        }).catch(sendError(res))
    }
}
