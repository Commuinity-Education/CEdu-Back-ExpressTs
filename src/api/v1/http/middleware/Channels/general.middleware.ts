import {NextFunction, Request, Response} from "express";
import Channels from "../../../../../models/Channels.model";
import Requests from "../../../../../models/Requests.model";
import {sendError, success} from "../../../../../utils/helpers/response";
import {REQUEST_TYPE} from "../../../../../Constants";
import {sMessages} from "../../../../../utils/constants/SMessages";
import * as uuid from 'uuid'
import ServerError from "../../../../../errors/serverError";
import {eMessages} from "../../../../../utils/constants/eMessages";

/**
 * @param id
 * @param user
 * @param {Response} res
 * @param {NextFunction} next
 * @throws {ServerError} for duplicate requests
 * @return {void}
 * */
export const requestPrivate = async ({params: {channelId: id}, user}: Request, res: Response, next: NextFunction) => {

    const channel: Channels = await Channels.findByPk(id, {
        attributes: ['id', 'isPrivate', 'ownerId'],
        raw: true
    })

    if (channel.isPrivate) {
        Requests.makeRequest(channel['ownerId'], user['id'], REQUEST_TYPE.channel, channel.id)
            .then(success(res, sMessages.REQUEST_SEND_OK))
            .catch(sendError(res))
    } else {
        next()
    }

}

/**
 * validate format of uuid in params
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @throws {ServerError}
 * */
export const channelParam = ({params: {channelId}, user}: Request, res: Response, next: NextFunction) => {
    if (!uuid.validate(channelId)) throw new ServerError(eMessages.UUID_NOT_VALID)
    next()
}