import {REQUEST_TYPE} from "../../../../Constants";
import Subscriber_Channel from "../../../../models/Subscriber-channel.model";
import Members_Group from "../../../../models/Members_Group.model";
import Notifications from "../../../../models/Notifications.model";
import {notifyMessage} from "../../../../utils/constants/notifyMessages";

type requestType = 'channel' | 'group'

/**
 * @classdesc all request functions is here
 * */
export class RequestService {
    /**
     * @param {string} requesterId
     * @param {string} userName
     * @param {type,id,name} type
     * @return Promise
     * */
    requestAccept(requesterId, userName, type: { type: requestType, id, name }): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let data, isCreated
            try {
                //make subscribe user to channel
                if (type.type === REQUEST_TYPE.channel) {
                    [data, isCreated] = await Subscriber_Channel.findOrCreate({
                        where: {
                            channelId: type.id,
                            subscriberId: requesterId
                        },
                        defaults: {
                            channelId: type.id,
                            subscriberId: requesterId
                        },
                        paranoid: false
                    })
                }
                if (type.type === REQUEST_TYPE.group) {
                    [data, isCreated] = await Members_Group.findOrCreate({
                        where: {
                            groupId: type.id,
                            memberId: requesterId
                        },
                        defaults: {
                            groupId: type.id,
                            memberId: requesterId
                        }
                    })
                }
                // if a user unsubscribe the channel, deletedAt, will set to a date and if user subscribe again deletedAt will be null
                if (!isCreated && data['deletedAt']) {
                    data.setDataValue('deletedAt', null)
                    data.save()
                }
                const notify = await Notifications.sendNotify(
                    requesterId,
                    notifyMessage.CHANNEL_OR_GROUP_ACCEPT(userName, type.name, type.type)
                )
                resolve(notify)
            } catch (e) {
                reject(e)
            }

        })
    }
}
