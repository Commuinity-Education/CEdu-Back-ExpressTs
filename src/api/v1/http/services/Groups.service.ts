import Groups from "../../../../models/Groups.model";
import {FindAttributeOptions, Op} from "sequelize";
import User from "../../../../models/User.model";
import Channels from "../../../../models/Channels.model";
import MembersGroup from "../../../../models/Members_Group.model"
import * as _ from 'lodash'

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
            where:{ id },
            attributes: [],
            include: [
                {
                    model: Groups,
                    as: 'groups',
                }
            ],
            // DESC-ASC
            order: [['groups','groupName', 'ASC']]
        })
            .then((user) => {
                let groups=user[0]['groups']
                return {
                    groups,
                    count:_.size(groups)
                }
            })

    }

    /**
     * get all groups by groups name
     * @return {Promise} Groups members and there counts
     * @param {UUID} groupId - id of group
     * */
    getGroupMembersList(groupId) {
        return MembersGroup.findAll({
            where: {
                groupId
            }
        }).then(membersGroup => {
            return {
                membersGroup,
                count:_.size(membersGroup)
            }
        })
    }
}
