const express = require('express')
const Router = express.Router();
const fs = require('fs');
const model = require("../models/goal_schema");
const moment = require('moment');
var mongo = require("mongoose")


class Goals {
    constructor() {
        Router.get('/goals/:id?', this.Get);
        Router.post('/goals', this.Post);
        Router.put('/goals/:id', this.Put);
        Router.delete('/goals/:id', this.delete);
    }

    // Get method
    Get = async (req, res) => {
        try {
            const { id } = req.params
            const input = req.query
            let conditions = {}
            if (id) {
                model.findById(id, function (err, item) {
                    return res.status(200).json({ message: "ok", data: item });
                });
            } else {
                const { type = null, name = null, goal_type = null, priority = null, status = null, withStats = null, page = 1, page_size = 20, parent = null } = req.query;
                if (type) {
                    conditions.type = type;
                }
                if (name) {
                    conditions.name = { $regex: name, $options: 'i' };
                }

                if (parent) {
                    conditions.parent = mongo.Types.ObjectId(parent);
                } else {
                    conditions.parent = { $exists: false };
                }
                model.paginate(conditions, { page, limit: page_size }, async function (err, items) {
                    if (err) {
                        return res.status(400).json({ message: err.message });
                    }
                    if (!parent) {
                        items = JSON.parse(JSON.stringify(items));
                        for (let gl of items.docs) {
                            const subitems = await model.find({ parent: gl._id }).exec()
                            gl.sub_goals = subitems
                            console.log(gl)
                        }
                        console.log("items")
                        return res.status(200).json({ message: "ok", data: items });
                    } else {
                        return res.status(200).json({ message: "ok", data: items });
                    }
                });
            }

        } catch (err) {
            return res.status(400).json({ message: err });
        }
    }

    Post = async (req, res) => {
        try {
            const input = req.body
            const item = new model(input);
            item.save((err, data) => {
                if (err) {
                    return res.status(400).json({ message: err });
                } else {
                    return res.status(200).json({ message: "item add successfuly", data: data });
                }
            });
        } catch (err) {

        }
    }

    Put = async (req, res) => {
        try {
            const { id } = req.params
            const input = req.body
            if (id) {
                model.findByIdAndUpdate(id, input, {}, (err, data) => {
                    if (err) {
                        return res.status(400).json({ message: err });
                    }
                    return res.status(200).json({ message: "item updated successfuly", data: data.id });
                })
            } else {
                return res.status(400).json({ message: "id is required" });
            }
        } catch (err) {
            return res.status(500).json({ message: err });
        }
    }

    delete = async (req, res) => {
        try {
            const { id } = req.params
            const input = req.body
            if (id) {
                model.findOneAndDelete({ _id: id }, {}, (err, data) => {
                    console.log(err, data)
                    if (err) {
                        return res.status(400).json({ message: err });
                    }
                    return res.status(200).json({ message: "item remove successfuly", data });
                })
            } else {
                return res.status(400).json({ message: "id is required" });
            }
        } catch (err) {

        }
    }

}
new Goals();
module.exports = Router;