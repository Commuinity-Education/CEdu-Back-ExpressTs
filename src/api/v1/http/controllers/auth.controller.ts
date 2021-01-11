import {Request, Response, Router} from "express";
import IController from "../../../../interfaces/controller.interface";
import User from "../../../../models/User.model";
import {sendError, success} from "../../../../utils/helpers/response";
import ServerError from "../../../../errors/serverError";
import {eMessages} from "../../../../utils/constants/eMessages";
import JWT from "../../../../libs/JWT";
import passport from "../../../../libs/passport";
import AuthenticationMiddleware from "../../../../middlewares/Authentication.middleware";
import {sMessages} from "../../../../utils/constants/SMessages";
import Email from "../../../../libs/Email";
import {Hash} from "../../../../libs/hash";

/**
 * @classdesc for login and signup
 * */
export default class AuthController implements IController {
  router = Router();

  constructor() {
    this.init();
  }

  init(): void {
    const authMiddleware = new AuthenticationMiddleware();
    this.router.post("/login", authMiddleware.controlLoginSignupBody, this.login);
    this.router.post("/signup", authMiddleware.controlLoginSignupBody, this.signup);
    this.router.put("/update", passport.token, authMiddleware.controlUpdateBody, this.updateAuth);
  }

  /**
   * @api {post} /auth/login Request For Login
   * @apiName Login
   * @apiGroup Auth
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
  private login({ body, ip }: Request, res: Response) {
    User.findByUsername(body.userName)
      .then((user) => {
        if (user && new Hash().verifyPassword(body.password, user.password)) {
          new Email().loginReport(user.email, ip)
          return AuthController.makeResponse(user);
        }
        throw new ServerError(eMessages.WRONG_USER_OR_PASS);
      })
      .then(success(res))
      .catch(sendError(res));
  }

  /**
   * @api {post} /auth/signup Request For register
   * @apiName Signup
   * @apiGroup Auth
   *
   * @apiParam {String} userName Required
   * @apiParam {String} password Required
   * @apiParam {String} email
   * @apiParam {String} phoneNumber
   * @apiParamExample {json} signup params
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
  //TODO check email
  private signup({ body }: Request, res: Response) {
    User._findOrCreate(body.userName, body)
      .then(async ([user, created]) => {
        if (!created) throw new ServerError(eMessages.USER_EXIST);
        if (user) return AuthController.makeResponse(user);
      })
      .then(success(res, sMessages.USER_CREATED))
      .catch(sendError(res));
  }

  /**
   * @api {put} /auth/update Request For update authentication
   * @apiName Update Auth
   * @apiGroup Auth
   *
   * @apiParam {String} userName Required
   * @apiParam {String} password Required
   * @apiParam {String} email
   * @apiParam {String} phoneNumber
   * @apiHeader {Bearer} Authorization  JWT token 
   * 
   * @apiParamExample {json} update params
   *                  {
   *                      "userName":"foo",
   *                      "password":"bar"
   *                  }
   * @apiSuccess (200) {String} message for updating successfully
   * @apiSuccessExample {json} Success-Response:
   *                      {
   *                          status:ok
   *                          code:2004,
   *                          message: update successful
   *                      }
   */
  private updateAuth({ body, user }: Request, res: Response) {
    User.findOne({
      where: { id: user["id"] },
    })
      .then((user) => {
        if (user) return user.update({ ...body });
      })
      .then(success(res, sMessages.UPDATE_AUTH_OK))
      .catch(sendError(res));
  }

 

  /**
   * make response object with koken and user detail exept password
   * @param {User} user - user instance
   * @param {any} meta - add extra field
   * @return object - returns object two property user and token
   * */
  private static makeResponse(user: User, meta = null): object {
    return {
      user: user.display(),
      meta,
      token: JWT.getToken(<number>user.id, { userName: user['userName'] }),
    };
  }


}

