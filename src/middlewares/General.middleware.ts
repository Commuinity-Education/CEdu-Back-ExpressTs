import {NextFunction, Request, Response} from "express";
import Channels from "../models/Channels.model";
import Requests from "../models/Requests.model";
import {REQUEST_TYPE} from "../Constants";
import {sendError, success} from "../utils/helpers/response";
import {sMessages} from "../utils/constants/SMessages";
import Groups from "../models/Groups.model";
import * as uuid from "uuid";
import ServerError from "../errors/serverError";
import {eMessages} from "../utils/constants/eMessages";


type reqType = "group" | "channel"
const channelOrGroupSwitcher = {
    'group': {
        model: Groups,
        id: 'groupId',
        title: 'groupName'
    },
    'channel': {
        model: Channels,
        id: 'channelId',
        title: 'title'
    },
}

export class GeneralMiddleware {
    /**
     * @description make request if channel or Group is private

     * @throws {ServerError} for duplicate requests
     * @return {void}
     * @param type tupe should be "group" or "channel"
     * */
    requestPrivate = (type: reqType) => async ({params, user}: Request, res: Response, next: NextFunction) => {

        const Model = channelOrGroupSwitcher[type].model

        const model = await Model.findByPk(params[channelOrGroupSwitcher[type].id], {
            raw: true
        })
        if (model['isPrivate']) {
            Requests.makeRequest(model['ownerId'], user['id'], REQUEST_TYPE[type], model['id'], model[channelOrGroupSwitcher[type].title])
                .then(success(res, sMessages.REQUEST_SEND_OK))
                .catch(sendError(res))
        } else {
            next()
        }

    }

    /**
     * validate format of uuid in params
     * @throws {ServerError}
     * @param type tupe should be "group" or "channel"
     * */
    validateParamId = (type: reqType) => ({params, user}: Request, res: Response, next: NextFunction) => {
        if (!uuid.validate(params[channelOrGroupSwitcher[type].id])) throw new ServerError(eMessages.UUID_NOT_VALID)
        next()
    }
}