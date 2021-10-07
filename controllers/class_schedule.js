const class_schedule = require("../models/class_schedule");
const Prog = require("../models/program")
var moment = require("moment");
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.Create = async (req, res) => {
    var proDetail = await Prog.find({ programName: req.body.program_name })
    if (proDetail) {
        let reqBody = req.body
        let startDate = moment(reqBody.start_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
        let endDate = moment(reqBody.end_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
        let repeat_weekly_on = reqBody.repeat_weekly_on
        function dateRange(startDate, endDate, steps = 1) {
            const dateArray = [];
            let currentDate = new Date(startDate);
            while (currentDate <= new Date(endDate)) {
                dateArray.push(moment(new Date(currentDate)).format('MM/DD/YYYY'));
                // Use UTC date to prevent problems with time zones and DST
                currentDate.setUTCDate(currentDate.getUTCDate() + steps);
            }

            return dateArray;
        }

        try {
            const dates = dateRange(startDate, endDate);
            let allAttendance = []
            for (let index in dates) {
                let date = moment(dates[index], 'MM/DD/YYYY').format('MM/DD/YYYY')
                let dayName = moment(new Date(date)).format('dddd').toLowerCase()
                if (repeat_weekly_on.includes(dayName)) {
                    let NewEvent = { ...reqBody, start_date: date, end_date: date }
                    delete NewEvent['repeat_weekly_on']
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
        //         console.log(err)
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

exports.read = async (req, res) => {
    try {
        let result = await class_schedule.find({})
        console.log(result)
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
    class_schedule.findById(id, { upsert: true })
        .populate('class_attendance')
        .then((result) => {
            var r = result.class_attendance
            var total = r.length
            res.json({ data: result, total: total })
        }).catch((err) => {
            res.send(err)
        })
};

exports.update = (req, res) => {
    const id = req.params.scheduleId;
    class_schedule.findByIdAndUpdate(id, { $set: req.body })
        .then((update_resp) => {
            console.log(update_resp)
            res.send("class schedule has been updated successfully")
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
};

exports.updateAll = (req, res) => {
    class_schedule.updateMany(
        { $and: [{ userId: req.params.userId }, { program_name: req.params.program_name }, { class_name: req.params.class_name }] },
        { $set: req.body }
    )
        .then((update_resp) => {
            console.log(update_resp)
            res.status(200).json({
                message: 'All class schedule has been updated Successfully',
                success: true
            })
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
};


exports.remove = (req, res) => {
    const id = req.params.scheduleId
    class_schedule.deleteOne({ _id: id })
        .then((resp) => {
            console.log(resp)
            res.json("class schedule has been deleted successfully")
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
};


exports.removeAll = (req, res) => {
    const id = req.params.scheduleId
    class_schedule.deleteMany(
        { $and: [{ userId: req.params.userId }, { program_name: req.params.program_name }, { class_name: req.params.class_name }] },
    )
        .then((resp) => {
            res.status(200).json({
                message: 'All class schedule has been deleted Successfully',
                success: true
            })
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
};