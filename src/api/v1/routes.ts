import AuthController from './http/controllers/auth.controller'
import InitialRoute from './initial.route'
import passport from "../../libs/passport";
import UserController from "./http/controllers/User.controller";
import ChannelsController from './http/controllers/Channel.controller';


const router = new InitialRoute({
    route: [
        {path: '/auth', controller: new AuthController(), middleware: []},
        {path: '/user', controller: new UserController(), middleware: [passport.token]},
        {path: '/channel', controller: new ChannelsController(), middleware: []},

    ]
}).router


export default router


