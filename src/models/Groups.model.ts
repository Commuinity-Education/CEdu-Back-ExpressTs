import {DataTypes} from "sequelize";
import BaseModel from "./Base.model";
import PersonalInfo from "./Personal-info.model";

export default class Groups extends BaseModel {
  static init(sequelize) {
    return super.init(
      {
        ...super.uuidID,
        ownerId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        groupName: {
          type: DataTypes.STRING
        },
        isPrivate: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        ...super.baseFields,
      },
        {
            sequelize,
            paranoid: true,
            timestamps: true,
            hooks: {
                async beforeCreate(groups: Groups, options) {
                    if (!groups.get('groupName')) groups.set('groupName', await groups.defaultTitle())
                },
            },
        }
    );
  }

    async defaultTitle() {
        const userId: any = this.get('ownerId')
        const userInfo = await PersonalInfo.findOne({
            where: {userId},
            raw: true
        })
        const defaultName = (userInfo && userInfo['lastName']) ? `${userInfo['lastName']}'s` : 'Untitled'
        return `${defaultName} Group`
    }

    static associate(models) {
        this.belongsTo(models.User, {
            as: "user",
            foreignKey: {
                allowNull: false,
                name: "ownerId",
            },
        });
        this.belongsToMany(models.User, {
      through: "Members_Group",
      as: "groupMember",
      foreignKey: "subscriberId",
    });
    this.hasMany(models.GroupMessages, {
      foreignKey: "groupId",
      as: "messages",
    });
  }
}
