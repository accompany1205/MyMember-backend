const express = require('express')
const Router = express.Router();
const fs = require('fs'); 
const model = require("../models/subgoal_schema");
const moment = require('moment');

class Goals {
    constructor() {
        Router.get('/sub_goals/:id?', this.Get);
        Router.post('/sub_goals', this.Post);
        Router.put('/sub_goals/:id', this.Put);
        Router.delete('/sub_goals/:id', this.delete);
    }

    // Get method
    Get = async (req, res) => {
        try {
            const {id} = req.params
            const input = req.query
            let conditions = {}
            if (id) {
                model.findById(id, function (err, item) {
                    return res.status(200).json({ message: "ok", data: item });
                });
            } else {
                const {goal = null, type = null, name = null, goal_type = null, priority = null, status = null , withStats = null , page = 1 , page_size  = 20 } = req.query;
                if (!goal){
                    return res.status(400).json({ message: "goal is required" });
                }
                model.find({goal: goal}, function (err, items) {
                    if (err) {
                        return res.status(400).json({ message: err.message });
                    }
                    return res.status(200).json({ message: "ok", data: items });
                });
            }

        } catch (err) {
            return res.status(400).json({ message: err });
        }
    }

    Post = async (req, res) => {
        try {
            const input = req.body
            const {goal} = input
            if (!goal){
                return res.status(400).json({ message: "goal is required" });
            }
            const item = new model(input);
            item.save((err, data) => {
                if (err) {
                    return res.status(400).json({ message: err });
                } else {
                    return res.status(400).json({ message: "item add successfuly", data: data  }) ;
                }
            });
        } catch (err) {

        }
    }

    Put = async (req, res) => {
        try {
            const {id} = req.params
            const input = req.body
            if (id) {
                model.findByIdAndUpdate(id, input , {} , (err , data)=>{
                    if (err) {
                        return res.status(400).json({ message: err });
                    }
                    return res.status(200).json({ message: "item updated successfuly"  , data });
                })
            }else{
                return res.status(400).json({ message: "id is required" });
            }
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: err });
        }
    }

    delete = async (req, res) => {
        try {
            const {id} = req.params
            const input = req.body
            if (id) {
                model.findOneAndDelete({_id : id}, {} , (err , data)=>{
                    console.log(err , data)
                    if (err) {
                        return res.status(400).json({ message: err });
                    }
                    return res.status(200).json({ message: "item remove successfuly"  , data });
                })
            }else{
                return res.status(400).json({ message: "id is required" });
            }
        } catch (err)  {

        }
    }

}
new Goals();
module.exports = Router;