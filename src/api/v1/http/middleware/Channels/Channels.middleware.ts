import Subscriber_Channel from "../../../../../models/Subscriber-channel.model";
import {NextFunction, Request, Response} from "express";
import {sendError} from "../../../../../utils/helpers/response";
import ServerError from "../../../../../errors/serverError";
import {eMessages} from "../../../../../utils/constants/eMessages";
import JoiValidator from "../../../../../utils/validators/joi";

export class ChannelsMiddleware {
    checkSubscriptionBefore({params, user}: Request, res: Response, next: NextFunction) {
        Subscriber_Channel.findOne({
            where: {
                channelId: params.channelId,
                subscriberId: user['id']
            }
        })
            .then(result => {
                if (result)
                    throw new ServerError(eMessages.SUBSCRIBED_BEFORE)
                next()
            })
            .catch(sendError(res))
    }

    /**
     * @param {string} req.body.title title of channel
     * @param {boolean} req.body.isPrivate restrict of channel
     * @throws {JoivalidationError} error
     */
    createAndUpdateChannelBody = (req: Request, res: Response, next): void => {
        const joi = new JoiValidator()
        req.body = joi.createChannelBody(req.body)
        next()
    }
}
