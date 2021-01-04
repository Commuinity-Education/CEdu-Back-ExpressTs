import {NextFunction, Request, Response} from "express";
import JoiValidator from "../../../../../utils/validators/joi";
import Groups from "../../../../../models/Groups.model";
import Subscriber_Channel from "../../../../../models/Subscriber-channel.model";
import ServerError from "../../../../../errors/serverError";
import {eMessages} from "../../../../../utils/constants/eMessages";
import {sendError} from "../../../../../utils/helpers/response";
import Members_Group from "../../../../../models/Members_Group.model";

export class GroupsMiddleware {
    constructor() {
    }

    /**
     * validate body of creating new group
     * @param {Object} req
     * @param {boolean} req.isPrivate
     * @param {string} req.groupName
     * @param res
     * @param next
     * */
    createGroup_validateBody(req: Request, res: Response, next: NextFunction) {
        const joi = new JoiValidator()
        req.body = joi.GroupCreateValidator(req.body)
        next()
    }

    /**
     * check user is joined before or not
     * @param {Object} params
     * @param {string} params.groupId
     * @param res
     * @param next
     * */
    checkJoinOneTime({params, user}: Request, res: Response, next: NextFunction) {
        Members_Group.findOne({
            where: {
                groupId: params.groupId,
                memberId: user['id']
            }
        })
            .then(result => {
                if (result)
                    throw new ServerError(eMessages.JOIN_BEFORE)
                next()
            })
            .catch(sendError(res))
    }
}
