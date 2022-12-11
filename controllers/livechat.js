const Channel = require('../models/channel');

exports.getChatHistory = async (req, res) => {
    const {machineId, adminId} = req.params;
    try{
        const channel = await Channel.findOne({machineId, adminId});
        res.json(channel);
    }
    catch(e) {
        res.send({
            code: 404,
            msg: "channel not found",
        })
    }
}

exports.getChannelsByAdminId = async (req, res) => {
    const { adminId } = req.params;
    try{
        const channels = await Channel.find({adminId});
        res.json(channels);
    }
    catch(e) {
        res.send({
            code: 404,
            msg: "channel not found",
        })
    }
}