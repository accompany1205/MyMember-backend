const class_schedule = require("../models/class_schedule");
const Prog = require("../models/program")
const dateRange = require('../Services/dateRange')
var moment = require("moment");
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.Create = async (req, res) => {
    var proDetail = await Prog.find({ programName: req.body.program_name })
    if (proDetail) {
        let reqBody = req.body
        let startDate = moment(reqBody.start_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
        let endDate = moment(reqBody.end_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
        let repeat_weekly_on = reqBody.repeat_weekly_on

        try {

            const dates = dateRange(startDate, endDate);

            let allAttendance = []
            for (let index in dates) {
                let date = moment(dates[index], 'MM/DD/YYYY').format('MM/DD/YYYY')
                let dayName = moment(new Date(date)).format('dddd').toLowerCase()
                if (repeat_weekly_on.includes(dayName)) {
                    let NewEvent = { ...reqBody, start_date: date, end_date: date, wholeSeriesEndDate: endDate, wholeSeriesStartDate: startDate }
                    // delete NewEvent['repeat_weekly_on']
                    allAttendance.push(NewEvent)
                }
            }
            await class_schedule.insertMany(allAttendance)
            res.send({ msg: 'Class schedule succefully!', success: true })
        } catch (error) {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })
        }
        // return
        // task.save((err, data) => {
        //     if (err) {
        //         res.send({ error: 'class schedule is not add', Error: err })
        //     }
        //     else {
        //         class_schedule.findByIdAndUpdate({ _id: data._id }, { $set: { userId: req.params.userId } })
        //             .exec((err, scheduleData) => {
        //                 if (err) {
        //                     res.send({ error: 'userId is not add in student' })
        //                 }
        //                 else {
        //                     res.send({ msg: 'class schedule is add successfully', data: scheduleData })
        //                 }
        //             })
        //     }
        // });
    } else {
        res.send({ msg: 'Somthing went wrong!', success: false })
    }
};

//checking 

exports.read = async (req, res) => {
    try {
        let result = await class_schedule.find({ userId: req.params.userId })
        res.send({ data: result, success: true })
    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }

    // const resp =
    //     class_schedule.find({ userId: req.params.userId })
    //         .then((result) => {
    //             res.json(result)
    //         }).catch((err) => {
    //             res.send(err)
    //         })
};

exports.class_schedule_Info = (req, res) => {
    const id = req.params.scheduleId
    class_schedule.findById(id)
        .then((result) => {
            res.json({ data: result, success: true })
        }).catch((err) => {
            res.send(err)
        })
};

exports.update = (req, res) => {
    const id = req.params.scheduleId;
    class_schedule.findByIdAndUpdate(id, { $set: req.body })
        .then((update_resp) => {

            res.status(200).send("class schedule has been updated successfully")
        }).catch((error) => {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })

        })
};

exports.updateAll = async (req, res) => {

    // var proDetail = await Prog.find({ programName: req.body.program_name })
    // if (proDetail) {
    let reqBody = req.body
    let startDate = moment(reqBody.start_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
    let endDate = moment(reqBody.end_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
    let repeat_weekly_on = reqBody.repeat_weekly_on


    const dates = dateRange(startDate, endDate);

    let allAttendance = []
    for (let index in dates) {
        let date = moment(dates[index], 'MM/DD/YYYY').format('MM/DD/YYYY')
        let dayName = moment(new Date(date)).format('dddd').toLowerCase()
        if (repeat_weekly_on.includes(dayName)) {
            let NewEvent = { ...reqBody, start_date: date, end_date: date, wholeSeriesEndDate: endDate, wholeSeriesStartDate: startDate }
            // delete NewEvent['repeat_weekly_on']
            allAttendance.push(NewEvent)
        }
    }

    const data = await class_schedule.deleteMany({
        $and:
            [{ userId: req.params.userId },
            { program_name: req.body.defaultprogram_name },
            { class_name: req.body.defaultclass_name }]
    })



        // await class_schedule.aggregate([
        //     {
        //         $project: {
        //             item: {
        //                 replaceAll: {
        //                     input: "$item",
        //                     find: {
        //                         $and:
        //                             [{ userId: req.params.userId },
        //                             { program_name: req.body.program_name },
        //                             { class_name: req.body.class_name }]
        //                     },
        //                     replacement: allAttendance
        //                 }
        //             }
        //         }
        //     }
        // ])
        .then(async (update_resp) => {
            if (update_resp.nModified < 1) {
                res.status(403).json({
                    message: 'class_name/program_name not found',
                    success: false
                })
            }
            else {
                const res1 = await class_schedule.insertMany(allAttendance);
                res.status(200).json({
                    message: 'All class schedule has been updated Successfully',
                    success: true
                })
            }
            // else {
            //     const res1 = await class_schedule.insertMany({ $and:[{ userId: req.params.userId },allAttendance]});
            //     res.status(200).json({
            //         message: 'All class schedule has been updated Successfully',
            //         success: true
            //     })
            // }
        }).catch((error) => {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })
        })
}


exports.remove = (req, res) => {
    const id = req.params.scheduleId
    class_schedule.deleteOne({ _id: id })
        .then((resp) => {
            res.json("class schedule has been deleted successfully")
        }).catch((error) => {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })

        })
};


exports.removeAll = (req, res) => {
    // const id = req.params.scheduleId
    class_schedule.deleteMany(
        {
            $and: [{ userId: req.params.userId },
            { program_name: req.body.program_name },
            { class_name: req.body.class_name }]
        }
    )
        .then((resp) => {
            if (resp.deletedCount < 1) {
                res.status(403).json({
                    message: 'class_name/program_name not found',
                    success: false
                })
            }
            else {
                res.status(200).json({
                    message: 'All class schedule has been deleted Successfully',
                    success: true

                })

            }

        }).catch((error) => {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })

        })
};