import Schemas from "./Schemas";
import * as Joi from 'joi'
import JoivalidationError from "../../errors/JoivalidationError";
import {Model, ModelAttributes} from "sequelize";
import * as _ from 'lodash'

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
     * @param {string} body.requesterId
     * @param {string} body.typeOfRequest
     * @param {string} body.typeId
     * @param {string} body.typeName
     * @return {Object} body - validated value if validation was ok
     * @throws {JoivalidationError} error - validation error
     * */
    public acceptOrRejectRequestBody(body: object){
        return this._validate(this.schema.requestStatusBody, body)
    }
    /**
     * @param {string} param - accept | reject
     * @return {Object} body - validated value if validation was ok
     * @throws {JoivalidationError} error - validation error
     * */
    public acceptOrRejectRequestParam(param: object) {
        return this._validate(this.schema.requestStatusParam, param)
    }


    /**
     * @param {string} body.groupName
     * @param {boolean} body.isPrivate
     * @return {Object} body - validated value if validation was ok
     * @throws {JoivalidationError} error - validation error
     * */
    public GroupCreateValidator(body) {
      return this._validate(this.schema.groupCreateBody,body)
    }

    /**
     * @param {Object} body request body data
     * @param {schema} schema schema object for validation
     * @return {Object} value
     * @throw {JoivalidationError} error
     */
    private _validate(schema, body) {
        const {value, error} = Joi.object(schema).validate(body)
        if (error) throw new JoivalidationError(error)
        return value
    }

}
