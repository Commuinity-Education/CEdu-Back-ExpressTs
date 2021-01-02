import {NextFunction, Request, Response} from "express";
import JoiValidator from "../../../../../utils/validators/joi";
import Groups from "../../../../../models/Groups.model";

export class GroupsMiddleware {
    constructor() {
    }

    createGroup_validateBody(req: Request, res: Response, next: NextFunction) {
        const joi = new JoiValidator()
        req.body = joi.GroupCreateValidator(req.body)
        next()
    }
}
