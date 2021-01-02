import {CreateOptions, DataTypes, FindAttributeOptions, InstanceUpdateOptions, UpdateOptions} from 'sequelize'
import BaseModel from './Base.model';
import {HookReturn} from "sequelize/types/lib/hooks";
import {Hash} from "../libs/hash";
import PersonalInfo from "./Personal-info.model";
import {cypher, Neo4j} from "../libs/Neo4j";
import Email from "../libs/Email";
import Channels from "./Channels.model";


export default class User extends BaseModel {
    static init(sequelize) {
        return super.init({
            ...super.uuidID,
            userName: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true
            },
            googleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                unique: true
            },
            isUni: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            ...super.baseFields,

        }, {
            sequelize,
            paranoid: true,
            timestamps:true,
            hooks: {
                beforeCreate(user: User, options) {
                    const password = user.get('password').toString()
                    return new Hash().hashPasword(password).then(hasedPass => {
                        user.set('password', hasedPass)
                    })
                },
                beforeUpdate(user, options: InstanceUpdateOptions): HookReturn {
                    const password = user.get('password').toString()
                    return new Hash().hashPasword(password).then(hasedPass => {
                        user.set('password', hasedPass)
                    })
                },
                afterCreate(user: User, options: CreateOptions): HookReturn {
                    return Promise.all([
                        cypher
                            .createNode('user', 'User', { ...user.display() })
                            .run(),
                        new Email().sendRegisterationEmail({
                            email: user['email'],
                            username: user.get('userName').toString(),
                            password: user.get('password').toString()
                        })
                    ]).then(res => {
                    })
                        .catch(e => {
                            console.log(e)
                        })


                },
                afterUpdate(user: User, options: UpdateOptions): HookReturn {

                    return new Neo4j()
                        .updateVar('user', 'User',
                            { id: user.get('id') },
                            { ...user.grapgAttr() })
                        .then(res => {
                        })
                        .catch(e => {
                            console.log(e)
                        })
                }
            }
        });
    }

    readonly id = this.get('id')
    readonly userName = this.get('userName')
    readonly password = this.get('password')
    readonly phoneNumber = this.get('phoneNumber')
    readonly isUni = this.get('isUni')
    readonly email = this.get('email')
    readonly googleId = this.get('googleId')

    static findByUsername(userName: string,): Promise<User> {
        return User.findOne({
            where: {
                userName
            },
            include: [
                {
                    model: PersonalInfo,
                    as: 'info'
                }
            ]
        })
    }

    static _findOrCreate(userName: string, body: object,): Promise<any> {
        return User.findOrCreate({
            where: {
                userName
            },
            defaults: { ...body },
        })
    }

    /**
     *
     * */
    display(withInfo: boolean = false) {
        let user = {}
        const neededFileds = ['id', 'userName', 'email', 'phoneNumber', 'isUni']
        neededFileds.map(field => {
            user[field] = this.get(field)
        })
        if (withInfo) return PersonalInfo.findOne({where: {userId: user['id']}}).then(info => Object.assign(user, info))
        return user
    }

    grapgAttr() {
        let user = {}
        const neededFileds = ['userName', 'email', 'phoneNumber', 'isUni']
        neededFileds.map(field => {
            user[field] = `'${this.get(field)}'`
        })
        return user
    }

/**
 * get user created channels (owned channels)
 * @param {Object} by  finding by user name or id
 * @param {FindAttributeOptions} includeAttr filter columns with attribute
 * @return {Promise} channels list and there counts
 * */
    static getUserChannelAndCount(by: { userName?, id?}, includeAttr?: FindAttributeOptions) {
        let where = by.userName ? { userName: by.userName } : { id: by.id }
        let _attributes = includeAttr ? { attributes: includeAttr } : null
        return this.findAndCountAll({
            where,
            attributes: [],
            
            include: [
                {
                    model: Channels,
                    as: 'channels',
                    ..._attributes,
                }
            ],
            // DESC-ASC
            order: [['channels','title', 'ASC']]
        })
            .then(({ count, rows }) => {
                if (rows.length)
                    return {
                        channels: rows[0]['channels'],
                        count
                    }
            })

    }

    static associate(models) {
        this.hasOne(models.PersonalInfo, {
            as: 'info',
            foreignKey: {
                allowNull: false,
                name: 'userId'
            },
        })
        this.hasMany(models.Channels, {
            as: 'channels',
            foreignKey: {
                allowNull: false,
                name: 'ownerId'
            },

        })
        this.belongsToMany(models.Channels, {
            through: 'Subscriber_Channel',
            as: 'subscribedChannels',
            foreignKey: 'subscriberId'

        })

        this.hasMany(models.Groups, {
            as: 'groups',
            foreignKey: {
                allowNull: false,
                name: 'ownerId'
            }
        })
        this.belongsToMany(models.Groups, {
            through: 'Members_Group',
            as: 'joinedGroups',
            foreignKey: 'memberId'

        })

        this.hasMany(models.Requests, {
            as: 'requests',
            foreignKey: {
                allowNull: false,
                name: 'userId'
            }
        })
        this.hasMany(models.Notifications, {
            as: 'notifications',
            foreignKey: {
                allowNull: false,
                name: 'userId'
            }
        })
        this.hasMany(models.Settings, {
            as: 'settings',
            foreignKey: {
                allowNull: false,
                name: 'userId'
            }
        })
        this.hasMany(models.Attachments, {
            as: 'attached',
            foreignKey: {
                allowNull: false,
                name: 'userId'
            }
        })
        this.hasMany(models.CaseHistorys, {
            as: 'historys',
            foreignKey: {
                allowNull: false,
                name: 'userId'
            }
        })
        this.hasMany(models.Quiz, {
            as: 'quizzes',
            foreignKey: {
                allowNull: false,
                name: 'userId'
            }
        })
    }

}
