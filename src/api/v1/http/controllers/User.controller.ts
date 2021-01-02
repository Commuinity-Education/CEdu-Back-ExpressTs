import { Request, Response, Router } from 'express'
import IController from '../../../../interfaces/controller.interface'
import PersonalInfo from "../../../../models/Personal-info.model";
import personalInfoBody from "../middleware/personal-info/saveValidator.middleware";
import { uploadAvatar } from "../../../../middlewares/upload/upload.middleware";
import { sendError, success } from "../../../../utils/helpers/response";
import { deleteFile } from "../../../../utils/helpers/general";
import User from "../../../../models/User.model";
import Channels from "../../../../models/Channels.model";

/**
 * @classdesc this class used for control user personal info
 * */
export default class UserController implements IController {
    router = Router()
    constructor() {
        this.init()
    }

    init(): void {
        this.router.post('/info', uploadAvatar, personalInfoBody, this.save)
        this.router.get('/info', this.getDetail)
        this.router.get('/getChannels', this.getSubscribedChannels)

    }
    /**
     * @api {post} /user/info Request for saving user info
     * @apiName save Personal info
     * @apiGroup user info
     *
     * @apiParam {String} userName Required
     * @apiParam {String} password Required
     * @apiParam {String} email
     * @apiParam {String} phoneNumber
     * @apiParamExample {json} login params
     *                  {
     *                      "userName":"foo",
     *                      "password":"bar"
     *                  }
     * @apiSuccess (200) {object} user User detail.
     * @apiSuccess (200) {String} token JWT Bearer Token.
     * @apiSuccessExample {json} Success-Response:
     *                      {
     *                          user:{
     *                              id:1,
     *                          },
     *                          token : <bearer-token>
     *                      }
     */
    private async save(req: Request, res: Response) {
        const { body, user, file } = req
        // if avatar not uploaded well not be touched , in update keep old file and in createng save default value
        const avatarfiled = (file && file.path) ? { avatar: file.path } : null
        PersonalInfo._CreateOrUpdate(user['id'], { ...avatarfiled, ...body }, true)
            .then((personalInfo) => {
                if (Array.isArray(personalInfo)) {
                    const [oldData, updatedDate] = personalInfo
                    if (avatarfiled) deleteFile(oldData['avatar'])
                    return updatedDate
                }
                return personalInfo
            })
            .then(success(res))
            .catch(sendError(res))
    }

    private getDetail(req: Request, res: Response) {
        PersonalInfo.findOne({
            where: {
                userId: req.user['id']
            },
            raw: true
        }).then(success(res))
    }

    private getSubscribedChannels({ user }: Request, res: Response) {
        User.findByPk(user['id'], {
            attributes: [],
            include: [
                {
                    model: Channels,
                    as: 'subscribedChannels',
                    through: {
                        attributes: [],
                    }
                }
            ]
        })
            .then(success(res))
            .catch(sendError(res))
    }


}
