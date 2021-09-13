const appoint = require("../models/appointment");
const _ = require('lodash')
// const todo = require("../models/todo_schema")

exports.Create = (req, res) => {
    var appoinemnt = req.body;

    if(appoinemnt.app_type == 'Event'){
    var App = _.extend(appoinemnt,req.params)
    console.log(App)
    const campaigns = new appoint(App);
    campaigns.app_color ='#ff0000'    
    campaigns.save((err, appdata) => {
        if (err) {
            res.send({error:'appoinment is not add'})        
            console.log(err)    
        }
        else{
            res.send(appdata)
        }
        })
    }

    else if(appoinemnt.app_type == 'Appoinment'){
        var App = _.extend(appoinemnt,req.params)
        console.log(App)
        const campaigns = new appoint(App);
        campaigns.app_color ='#75c900'    
        campaigns.save((err, appdata) => {
            if (err) {
                res.send({error:'appoinment is not add'})        
                console.log(err)    
            }
            else{
                res.send(appdata)
            }
            })
          }
    else if(appoinemnt.app_type == 'Testing'){
            var App = _.extend(appoinemnt,req.params)
            console.log(App)
            const campaigns = new appoint(App);
            campaigns.app_color ='#b66e7b'    
            campaigns.save((err, appdata) => {
                if (err) {
                    res.send({error:'appoinment is not add'})        
                    console.log(err)    
                }
                else{
                    res.send(appdata)
                }
                })
        }
    else if(appoinemnt.app_type == 'Camp'){
                var App = _.extend(appoinemnt,req.params)
                console.log(App)
                const campaigns = new appoint(App);
                campaigns.app_color ='#b66e7b'    
                campaigns.save((err, appdata) => {
                    if (err) {
                        res.send({error:'appoinment is not add'})        
                        console.log(err)    
                    }
                    else{
                        res.send(appdata)
                    }
                    })
           }

    
    }


exports.read = (req, res) => {
    appoint.find({userId:req.params.userId})
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};


exports.appointInfo = (req, res) => {
    const id = req.params.appointId
    appoint.findById(id)
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.update = (req, res) => {
    const id = req.params.appointId;
    appoint.findByIdAndUpdate(id, { $set: req.body })
        .then((update_resp) => {
            console.log(update_resp)
            res.send("Appointment has been updated successfully")
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
};

exports.remove =(req, res) => {
    const id = req.params.appointId
    appoint.deleteOne({ _id: id })
        .then((resp) => {
            console.log(resp)
            res.json("Appointment has been deleted successfully")
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
};