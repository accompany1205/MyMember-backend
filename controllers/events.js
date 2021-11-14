const events = require("../models/events");
const { errorHandler } = require('../helpers/dbErrorHandler');
// const todo = require("../models/todo_schema")


exports.Create = async (req, res) => {
    const campaigns = new events(req.body);
    campaigns.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.send("events has been added successfully");
    })
}

exports.read = async (req, res) => {
    events.find({})
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.update = async (req, res) => {
    const id = req.params.eventId;
    events.findByIdAndUpdate(id, { $set: req.body })
        .then((update_resp) => {
            res.send("events has been updated successfully")
        }).catch((err) => {
            res.send(err)
        })
};

exports.Info = async (req, res) => {
    const id = req.params.eventId
    events.findById(id)
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.remove = async (req, res) => {
    const id = req.params.eventId
    events.deleteOne({ _id: id })
        .then((resp) => {
            res.json("events has been deleted successfully")
        }).catch((err) => {
            res.send(err)
        })
};