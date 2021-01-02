import  passport from "passport";
import {ExtractJwt, Strategy as JwtStrategy} from "passport-jwt";
import config from "../configs/config";
import {eMessages} from "../utils/constants/eMessages";
import User from "../models/User.model";
import {sendError} from "../utils/helpers/response";
import ServerError from "../errors/serverError";

class Passport {
    constructor() {
        this.jwt()
    }

    private jwt() {
        let opts = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.secret
        };
       passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
            User.findByPk(jwt_payload.id).then(user => {
                if (user) return done(null, user.display())
                return done(new ServerError(eMessages.UNAUTHORIZED), false)
            }).catch(e => {
                return done(new ServerError(eMessages.UNAUTHORIZED), false)
            })
        }));

    }

    public initialize(){
        return passport.initialize()
    }

    public token(req,res,next){
        passport.authenticate('jwt',{session: false})(req,res,next)
    }

}

const pas=new Passport()
export default pas
