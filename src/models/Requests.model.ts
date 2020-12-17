import {DataTypes} from "sequelize";
import BaseModel from "./Base.model";
import {REQUEST_STATUS, REQUEST_STATUS_ENUM} from "../Constants";
import {eMessages} from "../utils/constants/eMessages";
import ServerError from "../errors/serverError";

export default class Requests extends BaseModel {
    static init(sequelize) {
        return super.init(
            {
                ...super.uuidID,
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                requesterId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                typeOfRequest: {
                    type: DataTypes.STRING,
                },
                typeId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                typeName: {
                    type: DataTypes.STRING,
                },
                status: {
                    type: DataTypes.ENUM(...REQUEST_STATUS_ENUM),
                    allowNull: false,
                },

                updatedBy: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                ...super.baseFields,
            },
            {
                sequelize,
                paranoid: true,
                timestamps: true,
                hooks: {},
            }
        );
    }

    static makeRequest(userId, requesterId, typeOfRequest: string, typeId,typeName) {
        return new Promise((resolve, reject) => {
            Requests.findOrCreate({
                where: {
                    userId,
                    requesterId,
                    typeOfRequest,
                    typeId,
                },
                defaults: {
                    userId,
                    requesterId,
                    typeOfRequest,
                    typeId,
                    typeName,
                    status: REQUEST_STATUS.pending,
                    updatedBy: requesterId
                }
            }).then(async ([request, isCreated]) => {
                if (!isCreated && (request['status'] !== REQUEST_STATUS.reject)) return reject(new ServerError(eMessages.REQUEST_EXIST))
                if (!isCreated && (request['status'] === REQUEST_STATUS.reject)) return resolve(request.update({status: REQUEST_STATUS.pending}))
                resolve(request)
            })
        })

    }

    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        })
    }
}
