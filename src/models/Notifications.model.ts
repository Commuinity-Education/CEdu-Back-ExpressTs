import {DataTypes} from "sequelize";
import BaseModel from "./Base.model";

export default class Notifications extends BaseModel {
  static init(sequelize) {
    return super.init(
      {
        ...super.uuidID,
          userId: {
              type: DataTypes.UUID,
              allowNull: false,
          },
          message: {
              type: DataTypes.STRING,
          },
          type: {
              type: DataTypes.STRING,
          },
          typeId: {
              type: DataTypes.UUID,
          },
          readStatus: {
              type: DataTypes.BOOLEAN,
              defaultValue: false,
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

/**
 * create a notification
 * @param {string} receiverId
 * @param {string} message
 * @param {string} type
 * @param {string} typeId
 *
 * */
    static sendNotify(receiverId, message: string, type: string = null, typeId = null) {
        return this.create({
            userId: receiverId,
            message,
            type,
            typeId
        })
    }

    static associate(models) {
        this.belongsTo(models.User, {
            as: 'users',
            foreignKey: {
                allowNull: false,
                name: 'userId'
            }
        })

    }
}
