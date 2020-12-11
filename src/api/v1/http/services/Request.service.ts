import Notifications from "../../../../models/Notifications.model";
import {notifyMessage} from "../../../../utils/constants/notifyMessages";
import Channels from "../../../../models/Channels.model";
import {REQUEST_TYPE} from "../../../../Constants";

export class RequestService {
    static requestAccept(requesterId, typeOfRequest, userName) {
        if (typeOfRequest === REQUEST_TYPE.channel)
            Channels.update({}, {where: {}}).then(channel => {
                return Notifications.sendNotify(
                    requesterId,
                    notifyMessage.CHANNEL_OR_GROUP_ACCEPT(userName, 'channelTitle', typeOfRequest)
                )
            })
    }
}