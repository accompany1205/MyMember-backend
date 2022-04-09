const textMessage = require("../models/text_message");
const member = require("../models/addmember");
const User = require("../models/user");
const jwt = require('jsonwebtoken');


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
                socket.join(room);
            })

            socket.on('leaveTextChatRoom', async (room) => {
                socket.leave(room);
            })

            socket.on("alertGetTexts", async (getText) => {
                try {
                    const { userId, uid } = getText;
                    const textList = await textMessage.find(getText);
                    io.to(`${userId}${uid}`).emit('getText', textList)
                } catch (err) {
                    console.log(err);
                }
            })

            socket.on('textAlertWebhook', async (uidObj) => {
                let uid = uidObj.uid
                let { userId } = await member.findOne({ _id: uid });
                console.log(uidObj, userId);
                io.to(userId).emit('getAlertText', uidObj)
                //socket.emit("getAlertText", "Hello Message!");
            });

            socket.on("locationUpdate", async (locationObj) => {
                try {
                    console.log(locationObj)
                    let { userId, access_location_list } = locationObj;
                    await User.updateOne({ _id: userId }, { $set: { isAccessLocations: true, locations: access_location_list } })
                    User.findOne({ _id: userId }, async (err, data) => {
                        if (err) {
                            console.log(err)
                        }
                        let locationData = await User.find({ _id: data.locations }).populate('default_location')
                        let default_locationData = await location.find({ _id: data.default_location });
                        //let current_locationData = await User.findOne({ locationName: req.body.locationName });
                        token = jwt.sign(
                            {
                                id: data._id,
                                auth_key: data.auth_key,
                                app_id: data.app_id,
                                epi: data.epi,
                                descriptor: data.descriptor,
                                product_description: data.product_description,
                            },
                            process.env.JWT_SECRET
                        );
                        res.cookie('t', token, {
                            expire: new Date() + 9999,
                        });
                        const {
                            _id,
                            username,
                            password,
                            name,
                            email,
                            role,
                            logo,
                            bussinessAddress,
                            country,
                            state,
                            city,
                        } = data;
                        var updatedData = {
                            success: true,
                            token,
                            data: {
                                _id,
                                //locationName: current_locationData.locationName,
                                default_locationData,
                                locations: [...locationData, ...default_locationData],
                                username,
                                password,
                                name,
                                email,
                                role,
                                logo,
                                bussinessAddress,
                                country,
                                state,
                                city,
                                isAccessLocations,
                            },
                        };
                        console.log(updatedData)
                        io.to(userId).emit("localStorageData", updatedData)
                    })


                } catch (err) {
                    console.log(err)
                }

            })

        });
    }
}

module.exports = SocketEngine;