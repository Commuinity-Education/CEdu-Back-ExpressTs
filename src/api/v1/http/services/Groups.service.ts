import Groups from "../../../../models/Groups.model";
import {Op} from "sequelize";
import User from "../../../../models/User.model";
import * as _ from 'lodash'
import Members_Group from "../../../../models/Members_Group.model";
import IUser from "../../../../interfaces/User.interface";

export class GroupsService {
    constructor() {
    }
    /**
     * get all groups by groups name
     * @return {Promise} Groups list and there counts
     * @param {string} groupName -name of group
     * */
    getListByGroupName(groupName) {
        return Groups.findAll({
            where: {
                groupName: {
                    [Op.iLike]: `%${groupName}%`
                }
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userName']
                },
                {
                    model: User,
                    as: 'groupMember',
                    attributes: ['userName']
                },
            ],
            attributes: ['id', 'groupName', "isPrivate", "createdAt"],
            order: [['groupName', 'ASC']]
        })
            .then(groups => {
                if (!groups.length) return null
                return groups.map(obj => {
                    let parsedObj = JSON.parse(JSON.stringify(obj))
                    parsedObj['memberCount'] = parsedObj['groupMember'].length
                    delete parsedObj['groupMember']
                    return parsedObj
                })
            })
    }

    /**
     * get user created Groups (owned Groups)
     * @return {Promise} Groups list and there counts
     * @param {string} id - find by user Id
     * */
    getUserGroupsAndCount(id) {
        return User.findAll({
            where: {id},
            attributes: [],
            include: [
                {
                    model: Groups,
                    as: 'groups',
                }
            ],
            // DESC-ASC
            order: [['groups', 'groupName', 'ASC']]
        })
            .then((user) => {
                let groups = user[0]['groups']
                return {
                    groups,
                    count: _.size(groups)
                }
            })

    }

    /**
     * @description save user Id and group Id in to Member_Group for joining user to group
     * @param {string} groupId that group to user want to join
     * @param {IUser} user user to want to join to group
     * @return {Members_Group<Promise>}  Members_Group
     * */
    joinGroup(groupId: string, user: IUser) {
        return Members_Group.findOrCreate({
            where: {
                groupId,
                memberId: user.id
            },
            defaults: {
                channelId: groupId,
                memberId: user.id
            },
            paranoid: false
        })
            .then(async ([data, isCreated]) => {
                //if created means its join now
                if (isCreated) return data
                // if find it and it was deleted make null to rejoin
                if (data['deletedAt']) {
                    data.setDataValue('deletedAt', null)
                    return data.save()
                }
            })

    }
}
