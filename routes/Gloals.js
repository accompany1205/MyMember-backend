const express = require('express')
const Router = express.Router();
const fs = require('fs');
const model = require("../models/goal_schema");
const moment = require('moment');
var mongo = require("mongoose")


const STATUS_DICT = {
    1: "In Progress",
    2: "Completed",
}

const Priority_DICT = {
    1: "Low",
    2: "Normal",
    3: "Hight",
    4: "Urgent",
}


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
            const {id} = req.params
            const input = req.query
            let conditions = {}
            if (id) {
                model.findById(id, function (err, item) {
                    return res.status(200).json({message: "ok", data: item});
                });
            } else {
                const {
                    type = null,
                    name = null,
                    goal_type = null,
                    priority = null,
                    status = null,
                    withStats = null,
                    page = 1,
                    page_size = 20,
                    parent = null
                } = req.query;
                if (type) {
                    conditions.type = type;
                }
                if (name) {
                    conditions.name = {$regex: name, $options: 'i'};
                }
                if (goal_type) {
                    conditions.goal_type = goal_type
                }
                if (status) {
                    conditions.status = status
                }

                if (parent) {
                    conditions.parent = mongo.Types.ObjectId(parent);
                } else {
                    conditions.parent = {$exists: false};
                }


                model.paginate(conditions, {page, limit: page_size}, async function (err, items) {
                    if (err) {
                        return res.status(400).json({message: err.message});
                    }


                    let stats = {}
                    if (withStats) {
                        stats = await model.aggregate([
                            {
                                $group: {
                                    _id: null,
                                    total: {$sum: 1},
                                    completed: {$sum: {$cond: [{$eq: ["$status", 2]}, 1, 0]}},
                                    inProgress: {$sum: {$cond: [{$eq: ["$status", 1]}, 1, 0]}},
                                }
                            }
                        ]);
                        console.log(stats)
                        stats = stats[0]
                    }


                    if (!parent) {
                        items = JSON.parse(JSON.stringify(items));

                        for (let gl of items.docs) {
                            const subitems = await model.find({parent: gl._id}).exec()
                            gl.sub_goals = subitems
                        }
                        return res.status(200).json({message: "ok", data: {...items, stats}});
                    } else {
                        return res.status(200).json({message: "ok", data: items});
                    }
                });
            }

        } catch
            (err) {
            return res.status(400).json({message: err});
        }
    }

    Post = async (req, res) => {
        try {
            const input = req.body
            const item = new model(input);
            item.save((err, data) => {
                if (err) {
                    return res.status(400).json({message: err});
                } else {
                    return res.status(200).json({message: "item add successfuly", data: data});
                }
            });
        } catch (err) {

        }
    }

    Put = async (req, res) => {
        try {
            const {id} = req.params
            let input = req.body
            if (id) {
                const findItem = await model.findOne({_id: id}).exec()
                let up_item = {...findItem._doc, ...input}
                if (up_item.goal_type === 'daily') {
                    let complete_days = up_item.complete_days ? up_item.complete_days.length : 0
                    console.log(complete_days)
                    up_item.start_date = moment(up_item.start_date).format('YYYY-MM-DD')
                    up_item.end_date = moment(up_item.end_date).format('YYYY-MM-DD')
                    let diff = moment(up_item.end_date).diff(moment(up_item.start_date), 'days')
                    up_item.status = (complete_days - 1) >= diff ? 2 : 1
                } else if (up_item.goal_type === 'fixed') {
                    let goal = up_item?.goal || 0
                    let current = up_item?.current || 0
                    up_item.status = current >= goal ? 2 : 1
                }
                model.findByIdAndUpdate(id, up_item, {}, (err, data) => {
                    if (err) {
                        return res.status(400).json({message: err});
                    }

                    return res.status(200).json({message: "item updated successfuly", data: up_item});
                })
            } else {
                return res.status(400).json({message: "id is required"});
            }
        } catch (err) {
            return res.status(500).json({message: err});
        }
    }

    delete = async (req, res) => {
        try {
            const {id} = req.params
            const input = req.body
            if (id) {
                model.findOneAndDelete({_id: id}, {}, (err, data) => {
                    console.log(err, data)
                    if (err) {
                        return res.status(400).json({message: err});
                    }
                    return res.status(200).json({message: "item remove successfuly", data});
                })
            } else {
                return res.status(400).json({message: "id is required"});
            }
        } catch (err) {

        }
    }

}

new

Goals();

module
    .exports = Router;