import {Request, Response, Router} from "express";
import Channels from "../../../../models/Channels.model";
import IController from "../../../../interfaces/controller.interface";
import {sendError, success} from "../../../../utils/helpers/response";
import passport from "../../../../libs/passport";
import User from "../../../../models/User.model";
import {sMessages} from "../../../../utils/constants/SMessages";
import ServerError from "../../../../errors/serverError";
import {eMessages} from '../../../../utils/constants/eMessages'
import Subscriber_Channel from "../../../../models/Subscriber-channel.model"
import PersonalInfo from "../../../../models/Personal-info.model";
import Groups from "../../../../models/Groups.model";
import {GroupsMiddleware} from "../middleware/groups/Groups.middleware";
import {GroupsService} from "../services/Groups.service";
import IUser from "../../../../interfaces/User.interface";
import {GeneralMiddleware} from "../../../../middlewares/General.middleware";
import MembersGroup from "../../../../models/Members_Group.model"


export default class GroupsController implements IController {
    router = Router()
    private middleware = new GroupsMiddleware()
    private generalMiddleware = new GeneralMiddleware()

    constructor() {
        this.init()
    }

    init() {
        this.router.post('/create', passport.token, this.middleware.createGroup_validateBody, this.createGroup)
        this.router.get('/list/:groupName', this.getGroupsByName)
        this.router.get('/list', passport.token, this.getOwneGroupList)
        this.router.post('/:groupId/join', passport.token, this.generalMiddleware.validateParamId('group'),this.middleware.checkJoinOneTime, this.generalMiddleware.requestPrivate("group"), this.join)

        this.router.put('/update/:channelId', passport.token, this.generalMiddleware.validateParamId('group'), this.updateChannel)
        this.router.delete('/remove/:channelId', passport.token, this.generalMiddleware.validateParamId('group'), this.deleteChannel)
        this.router.get('/:channelId/subscribers', passport.token, this.generalMiddleware.validateParamId('group'), this.getChannelsSubscribers)
        this.router.delete('/:channelId/unsubscribe', passport.token, this.generalMiddleware.validateParamId('group'), this.unsubscribe)
        this.router.get('/list/:groupId', passport.token , this.generalMiddleware.validateParamId('group') ,this.getGroupMembers)
        this.router.get('/list/join/:id', passport.token, this.getUsersJoinGroup)
        this.router.delete('/remove-group/:groupId', passport.token, this.generalMiddleware.validateParamId('group') ,this.deleteGroup) 
        this.router.delete('/unjoin-group/:groupId', passport.token, this.generalMiddleware.validateParamId('group') , this.unjoinGroup )
        this.router.delete('/:groupId/:memberId',passport.token, this.generalMiddleware.validateParamId('group'), this.ownerRemoveMember)
        this.router.put('/update-group/:groupId' , passport.token, this.generalMiddleware.validateParamId('group'),this.middleware.createAndUpdateGroupBody, this.updateGroup)
    }


    /**
     * @api {post} /groups/create create new group
     * @apiName Create Group
     * @apiGroup Groups
     *
     * @apiParam {String} groupName notRequired- default {lastname}'s channel
     * @apiParam {Boolean} isPrivate notRequired - default false
     * @apiHeader {Bearer} Authorization  JWT token
     * @apiParamExample {json} create params
     *                  {
     *                      "groupName":"foo",
     *                      "isPrivate":true
     *                  }
     * @apiSuccess (200) {object} data Groups detail.
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
     *    "groupName": "{lastname}'s Group",
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
    private createGroup({body, user}: Request, res: Response) {
        Groups.create({
            ownerId: user['id'],
            ...body
        })
            .then(success(res))
            .catch(sendError(res))
    }

    /**
     * @api {get} /groups/list/:groupName Get List Of Groups
     * @apiName Get Groups List - Public
     * @apiGroup Groups
     *
     * @apiSuccess (200) {object} data List of Groups detail.
     * @apiSuccessExample {json} Success-Response:
     *    {
     *      "status": 200,
     *      "code": 3000,
     *      "message": "ok",
     *      "data": [
     *                  {
     *                      "id": "2f955234-cf31-40d4-aaa6-f7c4b60035fa",
     *                      "groupName": "untitled Group",
     *                      "isPrivate": false,
     *                      "createdAt": "2020-12-19T11:07:10.832Z",
     *                      "user": {
     *                          "userName": "user1"
     *                      },
     *                      "memberCount": 0
     *                  },
     *             ]
     *     }
     * @apiError (404) not-Found many defrent error can be responsed
     * @apiErrorExample {json} Error-Response:
     *    HTTP/1.1 404 NotFound
     *     {
     *       status: 'error',
     *       code:1001 ,
     *       message: Not found
     *     }
     */
    private getGroupsByName({params}: Request, res: Response) {
        new GroupsService().getListByGroupName(params.groupName)
            .then(success(res))
            .catch(sendError(res))
    }

    /**
     * @api {get} /groups/list/  Get List Of Groups
     * @apiName Get User Groups private
     * @apiGroup Groups
     * @apiSuccess (200) {object} data List of Groups detail.
     * @apiHeader {Bearer} Authorization  JWT token
     * @apiSuccessExample {json} Success-Response:
     * {
     *      "status": 200,
     *      "code": 3000,
     *      "message": "ok",
     *      "data": {
     *          "groups": [
                    {
                        "id": "f95b8bce-c891-4b59-9f54-de7a211b1bc5",
                        "ownerId": "dfaea371-f40d-4ea1-aed5-20dec2165c7f",
                        "groupName": "untitled Group",
                        "isPrivate": false,
                        "createdAt": "2020-12-19T11:05:49.998Z",
                        "updatedAt": "2020-12-19T11:05:49.998Z",
                        "deletedAt": null
                    },
                 ],
                 "count": 1
     *      }
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
    private getOwneGroupList({user}: Request, res: Response) {
        new GroupsService().getUserGroupsAndCount(user['id'])
            .then(success(res))
            .catch(sendError(res))
    }

  /**
   * join in group
   * @param groupId
   * @param res
   * */
    private join({params, user}: Request, res: Response) {
        new GroupsService().joinGroup(params.groupId, <IUser>user)
            .then(success(res, sMessages.IS_SUBSCRIBE))
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
    private updateChannel({body, params, user}: Request, res: Response) {
        Channels.update({...body}, {
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
    private deleteChannel({params, user}: Request, res: Response) {
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
                    through: {attributes: []},
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



    /**
     * @api {get} /groups/list/:groupId Get List Of Groups Member List
     * @apiName Get Groups Member List - Public
     * @apiGroup Groups
     *
     * @apiSuccess (200) {object} data List of Groups Member List.
     * @apiSuccessExample {json} Success-Response:
     *    {
     *      "status": 200,
     *      "code": 3000,
     *      "message": "ok",
     *      "data": [
     *                  {
     *                      "id": "2f955234-cf31-40d4-aaa6-f7c4b60035fa",
     *                      "groupName": "untitled Group",
     *                      "isPrivate": false,
     *                      "createdAt": "2020-12-19T11:07:10.832Z",
     *                      "user": {
     *                          "userName": "user1"
     *                      },
     *                      "memberCount": 0
     *                  },
     *             ]
     *     }
     * @apiError (404) not-Found many defrent error can be responsed
     * @apiErrorExample {json} Error-Response:
     *    HTTP/1.1 404 NotFound
     *     {
     *       status: 'error',
     *       code:1001 ,
     *       message: Not found
     *     }
     */

    private getGroupMembers({params, user}: Request, res: Response) {
        new GroupsService().getGroupMembersList(params.groupId)
        .then(success(res))
        .catch(sendError(res))
    }
/**
     * @api {get} /groups//list/join/:id Get List Of Join group  List Of User
     * @apiName Get User's Join groups list - Public
     * @apiGroup Groups
     *
     * @apiSuccess (200) {object} data List of Groups Member List.
     * @apiSuccessExample {json} Success-Response:
     *    {
     *                  "status": 200,
     *                  "code": 3000,
     *                  "message": "ok",
     *                  "data": {
     *                  "JoinGroupList": [
     *                    {
     *                     "group.groupName": "test"
     *                      },
     *                      {
     *                    "group.groupName": "test5"
     *                   }
     *                 ],
     *             "count": 2
     *       }
     *    }
     * @apiError (404) not-Found many defrent error can be responsed
     * @apiErrorExample {json} Error-Response:
     *    HTTP/1.1 404 NotFound
     *     {
     *       status: 'error',
     *       code:1001 ,
     *       message: Not found
     *     }
     */

    private getUsersJoinGroup({params, user}: Request, res: Response) {
        new GroupsService().getUsersJoinGroupList(<IUser>user)
        .then(success(res))
        .catch(sendError(res))
    }



    private deleteGroup({params, user}: Request, res: Response) {
        Groups.destroy({
            where: {
                id: params.groupId,
            }
        }).then((number) => {
            if (number) return number
            throw new ServerError(eMessages.DELETE_UNABLE)
        })
            .then(success(res, sMessages.DELETE_OK))
            .catch(sendError(res))

    }

    private unjoinGroup({params, user} : Request, res:Response) {
        MembersGroup.destroy({
            where: {
                memberId: user['id'],
                groupId:params.groupId
            }
        }).then((number) => {
            if (number) return number
            throw new ServerError(eMessages.DELETE_UNABLE)
        })
            .then(success(res, sMessages.DELETE_OK))
            .catch(sendError(res))
    }
//remove member by group owner
    private ownerRemoveMember({params} : Request, res:Response) {
        return MembersGroup.destroy({
            where:{
                memberId: params.memberId,
                groupId: params.groupId 
            }
        }).then((number) => {
            if (number) return number
            throw new ServerError(eMessages.DELETE_UNABLE)
        })
            .then(success(res, sMessages.DELETE_OK))
            .catch(sendError(res))
    }
//TODO has err 
    //update Groups  -  127.0.01:10000/api/v1/groups/update-group/c8dae5e7-6a42-45a5-b122-d18f38920292
    private updateGroup({body ,params, user}: Request, res: Response) {
        const { groupName, isPrivate } = body
        
        return Groups.update({ groupName, isPrivate }, {
            where: {
                id: params.groupId ,
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
}
