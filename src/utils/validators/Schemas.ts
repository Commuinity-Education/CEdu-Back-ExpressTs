import * as Joi from 'joi'

/**
 * @classdesc this is schema class for joi validator. all schemas is here
 * */
export default class Schemas {
    // auth schema
    private _authSchema = {
        userName: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),

        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required(),


        email: Joi.string()
            .email({ minDomainSegments: 2 }),

        phoneNumber: Joi.string(),

        isUni: Joi.boolean()
    }
    /**
     * get authentication schema
     * */
    get authSchema() {
        return this._authSchema
    }

    set authSchema(schema: any) {
        this._authSchema = schema
    }

    // personal info schema
    private _personalInfoSchema = {
        name: Joi.string().required(),
        lastName: Joi.string().required(),
    }
    /**
     * get personal info body schema
     * */
    get personalInfoSchema() {
        return this._personalInfoSchema
    }

    set personalInfoSchema(schema: any) {
        this._personalInfoSchema = schema
    }


    // update auth schema

    private _updateAuth = {
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        email: Joi.string()
            .email({ minDomainSegments: 2 }),
        phoneNumber: Joi.string(),
    }
    /**
     * get authentication body update schema
     * @return updateAuth schema object
     * */
    get updateAuth() {
        return this._updateAuth
    }

    //new channel create need this propertis
    #createChannelBody = {
        isPrivate: Joi.boolean().empty(null),
        title: Joi.string().empty(null)
    }
    /** 
     * get new channel body data validation schemas
     * @return {Object} schema
     */
    get createChannelBody() {
        return this.#createChannelBody
    }

    #requestStatusBody = {
        requesterId:Joi.string().required(),
        typeOfRequest:Joi.string().required(),
        typeId:Joi.string().required(),
        typeName:Joi.string().required(),
    }
    /**
     * get request body schema
     * @return {Object} schema
     */
    get requestStatusBody() {
        return this.#requestStatusBody
    }

    #requestStatusParam = {
        status:Joi.any().valid('accept','reject')
    }
    /**
     * get request param schema
     * @return {Object} schema
     */
    get requestStatusParam() {
        return this.#requestStatusParam
    }

}
