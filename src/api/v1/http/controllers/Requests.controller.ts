import {Request, Response, Router} from "express";
import IController from "../../../../interfaces/controller.interface";
import Requests from "../../../../models/Requests.model";
import {REQUEST_STATUS} from "../../../../Constants";
import {sendError, success} from "../../../../utils/helpers/response";
import Notifications from "../../../../models/Notifications.model";
import {notifyMessage} from "../../../../utils/constants/notifyMessages";


export default class RequestsController implements IController {
    router = Router()

    constructor() {
        this.init()
    }

    init() {
        this.router.get('/new', this.getAllNewRequests)
    }


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

    private updateRequest({params, body, user}: Request, res: Response) {
        Requests.update({
            status: REQUEST_STATUS[params['status']],
            updatedBy: user['id']
        }, {
            where: {
                userId: user['id'],
                requesterId: body.requesterId,
                typeOfRequest: body.typeOfRequest,
                typeId: body.typeId

            }
        })
            .then(() => {
                if (REQUEST_STATUS[params['status']] === REQUEST_STATUS.accept) {


                }
            })
            .then(success(res))
            .catch(sendError(res))
    }



}