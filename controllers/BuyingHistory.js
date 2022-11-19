const BuyingHistory = require("../models/BuyingHistory");



exports.createBuyHistory = async (req, res) => {
    
    try {
        BuyingHistory(req.body)
            .save()
            .then((item) => res.json({ success: true, data: item }))
    } catch (error) {

        res.json({ success: false, message: "Something went wrong" })
    }
}  
exports.getBuyHistory = async (req, res) => {
    try {
        await BuyingHistory.find({}, function (req, items) {
            res.json({ success: true, data: items })
        })
    } catch (error) {
        res.json({ success: false, message: "Something went wrong" })
    }
}