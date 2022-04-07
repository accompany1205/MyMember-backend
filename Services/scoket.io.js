const textMessage = require("../models/text_message");
const member = require("../models/addmember");


class SocketEngine {
    constructor(io) {
        this.sConnection = io;
        this.init();
    }

    async init() {
        //start listen
        var io = this.sConnection
        this.sConnection.on('connection', function (socket) {

            socket.on('joinTextChatRoom', async (room) => {
                socket.join(room)
            })

            socket.on("alertGetTexts", async (getText) => {
                try {
                    const { userId } = getText;
                    const textList = await textMessage.find(getText);
                    io.emit('getText', textList)
                } catch (err) {
                    console.log(err);
                }
            })

            socket.on('textAlertWebhook', async (uidObj) => {
                let uid = uidObj.uid
                let {userId} = await member.findOne({_id:uid});
                console.log(uidObj, userId);
                io.to(userId).emit('getAlertText', uidObj)
                //socket.emit("getAlertText", "Hello Message!");
            })

        });
    }
}

module.exports = SocketEngine;