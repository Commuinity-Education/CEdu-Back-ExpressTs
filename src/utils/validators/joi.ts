import Schemas from "./Schemas";
import * as Joi from 'joi'
import ServerError from "../../errors/serverError";
import JoivalidationError from "../../errors/JoivalidationError";
import { eMessages } from "../constants/eMessages";

/**
 * @classdesc this class is for validation objectes
 * */
export default class JoiValidator {
    Joi = Joi
    private schema = new Schemas()

    constructor() {
    }

    public authValidate(body: object) {
        return this._validate(this.schema.authSchema, body)
    }

    /**
     * @param {string} body.password
     * @param {string} body.phoneNumber
     * @param {string} body.email
     * @return {object} body - validated value if validation was ok
     * @throws error - validation error
     * */
    public authUpdateValidate(body) {
        return this._validate(this.schema.updateAuth, body)
    }


    public personalInfoValidator(body: object) {
        return this._validate(this.schema.personalInfoSchema, body)
    }

    /**
        * @param {string} body.title
        * @param {boolean} body.isPrivate
        * @return {Object} body - validated value if validation was ok
        * @throws {JoivalidationError} error - validation error
        * */
    public createChannelBody(body: object) {
        return this._validate(this.schema.createChannelBody, body)
    }






    /**
     * @param {Object} body request body data
     * @param {schema} schema schema object for validation
     * @return {Object} value
     * @throw {JoivalidationError} error
     */
    private _validate(schema, body) {
        const { value, error } = Joi.object(schema).validate(body)
        if (error) throw new JoivalidationError(error)
        return value
    }

}
