const textMessage = require("../models/text_message");


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
                    io.to(userId).emit('getText', textList)
                } catch (err) {
                    console.log(err);
                }
            })

            socket.on('textAlertWebhook', async (stuid) => {
                console.log(stuid);
                io.to("606aea95a145ea2d26e0f1ab").emit('getAlertText', stuid)
                //socket.emit("getAlertText", "Hello Message!");
            })

        });
    }
}

module.exports = SocketEngine;