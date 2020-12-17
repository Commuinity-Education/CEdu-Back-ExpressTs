import {Request, Response, Router} from "express";
import IController from "../../../../interfaces/controller.interface";
import Requests from "../../../../models/Requests.model";
import {REQUEST_STATUS} from "../../../../Constants";
import {sendError, success} from "../../../../utils/helpers/response";
import {RequestService} from "../services/Request.service";
import {sMessages} from "../../../../utils/constants/SMessages";
import {RequestsMiddleware} from "../middleware/Requests/Requests.middleware";


export default class RequestsController implements IController {
    router = Router()
  private static requestService = new RequestService()
    private middleware = new RequestsMiddleware()

    constructor() {
        this.init()
    }

    init() {
        this.router.get('/new', this.getAllNewRequests)
        this.router.put('/status/:status', this.middleware.acceptOrReject, this.middleware.canChangeStatus, this.updateRequest)
    }

    /**
     * @api {get} /request/new Get All new (pending) Requests List
     * @apiName Requests List
     * @apiGroup Request
     * @apiHeader {Bearer} Authorization  JWT token
     * @apiSuccessExample {json} Success-Response:
     *                      {
     * "status": 200,
     * "code": 3008,
     * "message": "ok",
     * "data": [
     *     {
     *      "id": "5e98f7ec-92f6-4dcc-bad9-faa99e9d40a2",
            "userId": "dfaea371-f40d-4ea1-aed5-20dec2165c7f",
            "requesterId": "c4f88440-8c67-4106-a606-82b7651584c5",
            "typeOfRequest": "channel",
            "typeId": "e530c15c-00ee-46cb-bef5-6966b44a5a66",
            "typeName": null,
            "status": "PENDING",
            "updatedBy": "c4f88440-8c67-4106-a606-82b7651584c5",
            "createdAt": "2020-12-08T07:59:20.199Z",
            "updatedAt": "2020-12-08T07:59:20.199Z",
            "deletedAt": null
     *     }
     * ]
     *
     *
     *}
     * @apiError (400) Bad-Request many defrent error can be responsed
     * @apiErrorExample {json} Error-Response:
     *    HTTP/1.1 404 NotFound
     *     {
     *       status: 'error',
     *       code:2001 ,
     *       message: "NotFound"
     *     }
     */
    private getAllNewRequests({user}: Request, res: Response) {
        Requests.findAll({
            where: {
                userId: user['id'],
                status: REQUEST_STATUS.pending
            }
        })
            .then(success(res))
            .catch(sendError(res))
    }

    /**
     * @api {put} /request/status/:status Accept Or Reject Request
     * @apiName Accept Or Reject Request
     * @apiGroup Request
     * @apiHeader {Bearer} Authorization  JWT token
     * @apiSuccess (200) {string} message Request Accepted
     * @apiSuccess (200) {string} message Request Rejected
     * @apiSuccessExample {json} Success-Response:
     *                      {
     * "status": 200,
     * "code": 3008,
     * "message": "Request Rejected",
     * "data": null
     *}
     * @apiError (400) Bad-Request many defrent error can be responsed
     * @apiErrorExample {json} Error-Response:
     *    HTTP/1.1 404 NotFound
     *     {
     *       status: 'error',
     *       code:2001 ,
     *       message: "NotFound"
     *     }
     */
    private updateRequest({params, body, user}: Request, res: Response) {
        Requests.update({
            status: REQUEST_STATUS[params['status']],
            updatedBy: user['id']
        }, {
            where: {
                userId: user['id'],
                requesterId: body.requesterId,
                typeOfRequest: body.typeOfRequest,
                typeId: body.typeId,
                status: REQUEST_STATUS.pending
            }
        })
            .then(async () => {
                if (REQUEST_STATUS[params['status']] === REQUEST_STATUS.accept)
                    return RequestsController.requestService.requestAccept(body.requesterId, user['userName'], {
                        type: body.typeOfRequest,
                        name: body.typeName,
                        id: body.typeId
                    })
                return
            }).then(success(res,
            REQUEST_STATUS[params['status']] === REQUEST_STATUS.accept ?
                sMessages.ACCEPT_REQUEST :
                sMessages.REJECT_REQUEST
        ))
            .catch(sendError(res))
    }

}
