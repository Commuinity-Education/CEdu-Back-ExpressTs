import {Request, Response, Router} from "express";
import Channels from "../../../../models/Channels.model";
import IController from "../../../../interfaces/controller.interface";
import {sendError, success} from "../../../../utils/helpers/response";
import {createAndUpdateChannelBody} from "../middleware/Channels/body.middleware"
import passport from "../../../../libs/passport";
import User from "../../../../models/User.model";
import {sMessages} from "../../../../utils/constants/SMessages";
import ServerError from "../../../../errors/serverError";
import {eMessages} from '../../../../utils/constants/eMessages'
import Subscriber_Channel from "../../../../models/Subscriber-channel.model"
import PersonalInfo from "../../../../models/Personal-info.model";
import {channelParam, requestPrivate} from "../middleware/Channels/general.middleware";
import {ChannelsMiddleware} from "../middleware/Channels/Channels.middleware";


export default class ChannelsController implements IController {
    router = Router()
    private middleware = new ChannelsMiddleware()

    constructor() {
        this.init()
    }

    init() {
        this.router.post('/create', passport.token, createAndUpdateChannelBody, this.createChannel)
        this.router.get('/list/:userName', this.getAllChannels)
        this.router.get('/list', passport.token, this.getOwneChannelList)
        this.router.put('/update/:channelId', passport.token, channelParam, createAndUpdateChannelBody, this.updateChannel)
        this.router.delete('/remove/:channelId', passport.token, channelParam, this.deleteChannel)
        this.router.post('/:channelId/subscribe', passport.token, channelParam, this.middleware.checkSubscriptionBefore, requestPrivate, this.subscribe)
        this.router.get('/:channelId/subscribers', passport.token, channelParam, this.getChannelsSubscribers)
        this.router.delete('/:channelId/unsubscribe', passport.token, channelParam, this.unsubscribe)
    }


    /**
   * @api {post} /channel/create create new channel
   * @apiName Create Channel
   * @apiGroup Channel
   *
   * @apiParam {String} title notRequired- default {lastname}'s channel
   * @apiParam {Boolean} isPrivate notRequired - default false
   * @apiHeader {Bearer} Authorization  JWT token 
   * @apiParamExample {json} create params
   *                  {
   *                      "title":"foo",
   *                      "isPrivate":true
   *                  }
   * @apiSuccess (200) {object} data Channel detail.
   * @apiSuccessExample {json} Success-Response:
   *                      {
   * "status": 200,
   * "code": 3000,
   * "message": "ok",
   * "data": {
   *    "id": "96a59718-e4a3-4c24-8854-9d21c63921a9",
   *    "ownerId": "dfaea371-f40d-4ea1-aed5-20dec2165c7f",
   *     "isPrivate": false,
   *     "updatedAt": "2020-12-08T11:51:48.796Z",
   *    "createdAt": "2020-12-08T11:51:48.796Z",
   *    "title": "{lastname}'s Channel",
   *    "deletedAt": null
   *}
   *}
   * @apiError (500) server-error many defrent error can be responsed
   * @apiErrorExample {json} Error-Response:
   *    HTTP/1.1 500 internal server error
   *     {
   *       status: 'error',
    *       code:2001 ,
    *       message: this is an error
   *     }
   */
    private createChannel({ body, user }: Request, res: Response) {
        Channels.create({
            ownerId: user['id'],
            ...body
        })
            .then(success(res))
            .catch(sendError(res))
    }

     /**
   * @api {get} /channel/list/:userName Get List Of Channeles
   * @apiName Get User Channels Public
   * @apiGroup Channel
   *
   * @apiSuccess (200) {object} data List of Channels detail.
   * @apiSuccessExample {json} Success-Response:
   *                      {
   *"status": 200,
   *  "code": 3000,
   * "message": "ok",
   *"data": {
   *   "channels": [
   *      {
   *         "id": "acb002d5-daf5-48f1-9ea5-914dd5504d11",
   *        "title": "daneshjoo's Channel",
   *       "isPrivate": false,
   *      "createdAt": "2020-12-08T09:20:02.665Z",
   *     "updatedAt": "2020-12-08T09:20:02.665Z",
   *    "deletedAt": null
   *},
   *]
   *}
   *}
   * @apiError (404) not-Found many defrent error can be responsed
   * @apiErrorExample {json} Error-Response:
   *    HTTP/1.1 404 NotFound
   *     {
   *       status: 'error',
    *       code:1001 ,
    *       message: Not found
   *     }
   */
    private getAllChannels({ params }: Request, res: Response) {
        User.getUserChannelAndCount({ userName: params['userName'] }, { exclude: ['ownerId'] })
            .then(success(res))
            .catch(sendError(res))
    }

     /**
   * @api {get} /channel/list/  Get List Of Channeles need auth
   * @apiName Get User Channels private
   * @apiGroup Channel
   *
   * @apiSuccess (200) {object} data List of Channels detail.
   * @apiHeader {Bearer} Authorization  JWT token 
   * @apiSuccessExample {json} Success-Response:
   *                      {
   *"status": 200,
   *  "code": 3000,
   * "message": "ok",
   *"data": {
   *   "channels": [
   *      {
   *         "id": "acb002d5-daf5-48f1-9ea5-914dd5504d11",
   *        "title": "daneshjoo's Channel",
   *       "isPrivate": false,
   *      "createdAt": "2020-12-08T09:20:02.665Z",
   *     "updatedAt": "2020-12-08T09:20:02.665Z",
   *    "deletedAt": null
   *},
   *]
   *}
   *}
   * @apiError (404) not-Found many defrent error can be responsed
   * @apiErrorExample {json} Error-Response:
   *    HTTP/1.1 404 NotFound
   *     {
   *       status: 'error',
    *       code:1001 ,
    *       message: Not found
   *     }
   */
    private getOwneChannelList({ user }: Request, res: Response) {
        User.getUserChannelAndCount({ id: user['id'] })
            .then(success(res))
            .catch(sendError(res))
    }

     /**
   * @api {put} /channel/update/:channelId Update Channel
   * @apiName Update Channel
   * @apiGroup Channel
   *
   * @apiParam {String} title notRequired
   * @apiParam {Boolean} isPrivate notRequired 
   * @apiHeader {Bearer} Authorization  JWT token 
   * @apiParamExample {json} create params
   *                  {
   *                      "title":"foo",
   *                      "isPrivate":true
   *                  }
   * @apiSuccess (200) {string} message update was successfu.
   * @apiSuccessExample {json} Success-Response:
   *                      {
   * "status": 201,
   * "code": 3000,
   * "message": "update was successfu",
   * "data": null
   *}
   * @apiError (500) server-error many defrent error can be responsed
   * @apiErrorExample {json} Error-Response:
   *    HTTP/1.1 500 internal server error
   *     {
   *       status: 'error',
    *       code:2001 ,
    *       message: this is an error
   *     }
   */
    private updateChannel({ body, params, user }: Request, res: Response) {
        Channels.update({ ...body }, {
            where: {
                id: params.channelId,
                ownerId: user['id']
            }
        })
            .then(([number]) => {
                if (number) return number
                throw new ServerError(eMessages.UPDATE_UNABLE)
            })
            .then(success(res, sMessages.UPDATE_AUTH_OK))
            .catch(sendError(res))
    }


    /**
   * @api {delete} /channel/remove/:channelId Delete Channel
   * @apiName Delete Channel
   * @apiGroup Channel
   * @apiHeader {Bearer} Authorization  JWT token 
   * @apiSuccess (200) {string} message update was successfu.
   * @apiSuccessExample {json} Success-Response:
   *                      {
   * "status": 200,
   * "code": 3004,
   * "message": "Deletion was successful",
   * "data": null
   *}
   * @apiError (400) Bad-Request many defrent error can be responsed
   * @apiErrorExample {json} Error-Response:
   *    HTTP/1.1 400 Bad Request
   *     {
   *       status: 'error',
    *       code:2001 ,
    *       message: "unable to delete"
   *     }
   */
    private deleteChannel({ params, user }: Request, res: Response) {
        Channels.destroy({
            where: {
                id: params.channelId,
                ownerId: user['id']
            }
        }).then((number) => {
            if (number) return number
            throw new ServerError(eMessages.DELETE_UNABLE)
        })
            .then(success(res, sMessages.DELETE_OK))
            .catch(sendError(res))
    }


    /**
     * @api {post} /channel/:channelId/subscribe Subscribe Channel
     * @apiName Subscribe Channel
     * @apiGroup Channel
     * @apiParam {String} channelId Required - need channel id from param to subscribe
     * @apiHeader {Bearer} Authorization  JWT token
     * @apiSuccess (200) {string} message Request send successfully.
     * @apiSuccessExample {json} Success-Response:
     *                      {
     * "status": 200,
     * "code": 3006,
     * "message": "Request send successfully",
     * "data": null
     *}
     * @apiError (400) Bad-Request many defrent error can be responsed
     * @apiErrorExample {json} Error-Response:
     *    HTTP/1.1 404 notFound
     *     {
     *       status: 'error',
     *       code:1001 ,
     *       message: "notFound"
     *     }
     */
    private subscribe({params, user}: Request, res: Response) {
        Subscriber_Channel.findOrCreate({
            where: {
                channelId: params.channelId,
                subscriberId: user['id']
            },
            defaults: {
                channelId: params.channelId,
                subscriberId: user['id']
            },
            paranoid: false
        })
            .then(async ([data, isCreated]) => {
                if (isCreated) return data
                // if a user unsubscribe the channel, deletedAt, will set to a date and if user subscribe again deletedAt will be null
                if (data['deletedAt']) {
                    data.setDataValue('deletedAt', null)
                    return data.save()
                }
            })
            .then(success(res, sMessages.IS_SUBSCRIBE))
            .catch(sendError(res))
    }

    /**
     * @api {get} /channel/:channelId/subscribers  Get List Of subscribers
     * @apiName Get Channel Subscribers
     * @apiGroup Channel
     * @apiParam {String} channelId Required - need channel id from param to get list
     * @apiSuccess (200) {object} data List of Channel subscribers.
     * @apiHeader {Bearer} Authorization  JWT token
     * @apiSuccessExample {json} Success-Response:
     * {
     *"status": 200,
     *  "code": 3000,
     * "message": "ok",
     *"data": {
     *   "subscribers": [
     *                      {
     *                           "userName": "user1",
     *                           "phoneNumber": null,
     *                           "email": null,
     *                           "info": {
     *                               "name": "user1",
     *                               "lastName": "user1",
     *                               "avatar": null
     *                           }
     *                       }
     *                  ]
     *      }
     * }
     * @apiError (404) not-Found many defrent error can be responsed
     * @apiErrorExample {json} Error-Response:
     *    HTTP/1.1 404 NotFound
     *     {
     *       status: 'error',
     *       code:1001 ,
     *       message: Not found
     *     }
     */
    private getChannelsSubscribers({params}: Request, res: Response) {
        Channels.findAndCountAll({
            where: {
                id: params.channelId,
            },
            attributes: [],
            include: [
                {
                    model: User,
                    as: 'subscribers',
                    attributes: ['userName', 'phoneNumber', 'email'],
                    through: { attributes: [] },
                    include: [{
                        model: PersonalInfo,
                        as: 'info',
                        attributes: ['name', 'lastName', 'avatar']
                    }]
                }
            ],
            // DESC-ASC
            order: [['subscribers', 'info', 'lastName', 'ASC']]
        })
            .then(({count, rows}) => {
                return {
                    subscribers: rows[0]['subscribers'],
                    count
                }
            })
            .then(success(res))
            .catch(sendError(res))
    }

    /**
     * @api {delete} /channel/:channelId/unsubscribe Unsubscribe Channel
     * @apiName Unsubscribe Channel
     * @apiGroup Channel
     * @apiParam {String} channelId Required - need channel id from param to unsubcribe user
     * @apiHeader {Bearer} Authorization  JWT token
     * @apiSuccess (200) {string} message User Unsubscribed.
     * @apiSuccessExample {json} Success-Response:
     *                      {
     * "status": 200,
     * "code": 3009,
     * "message": "User Unsubscribed",
     * "data": null
     *}
     * @apiError (400) Bad-Request many defrent error can be responsed
     * @apiErrorExample {json} Error-Response:
     *    HTTP/1.1 400 Bad Request
     *     {
     *       status: 'error',
     *       code:2001 ,
     *       message: "unable to delete"
     *     }
     */
    private unsubscribe({params, user}: Request, res: Response) {
        Subscriber_Channel.destroy({
            where: {
                channelId: params.channelId,
                subscriberId: user['id'],
            },
        })
            .then(success(res, sMessages.UNSUBSCRIBE))
            .catch(sendError(res))
    }

}
