const WorkHistory = require("../models/workHistory");
const user = require("../models/user");
const { errorHandler } = require("../helpers/dbErrorHandler");
const url = require("url");

exports.getWorkHistory = (req, res) => {
  const { employeeId } = req.params;
  const histories = WorkHistory.find({ userId: employeeId })
    .then((result) => {
      const historyResult = result.map((history) => {
        const {screenshots, ...newHistory} = history._doc;
        return newHistory;
      })
      console.log(historyResult);
      res.json(historyResult);
    })
    .catch((e) => res.json(e));
};

exports.startWork = (req, res) => {
  const { userId, description } = req.body;
  const newWorkHistory = new WorkHistory({
    userId,
    startTime: new Date(),
    description,
  });
  newWorkHistory
    .save()
    .then((result) => res.json(result))
    .catch((err) => res.send(err));
};

exports.endWork = async (req, res) => {
  const { historyId, userId, description } = req.body;
  WorkHistory.findByIdAndUpdate(historyId, {
    endTime: new Date(),
  })
    .then((result) => res.json(result))
    .catch((err) => res.send(err));
};

exports.updateWork = async (req, res) => {
  const { historyId, userId, screenshot } = req.body;
  const oldHistory = await WorkHistory.findById(historyId);
  if (oldHistory)
    WorkHistory.findByIdAndUpdate(historyId, {
      endTime: new Date(),
      screenshots: [
        ...oldHistory.screenshots,
        {
          trackTime: new Date(),
          screenshot: screenshot,
        },
      ],
    })
      .then((result) => res.json(result))
      .catch((err) => res.send(err));
};

exports.getOverview = async (req, res) => {
  try{
  const { employeeId } = req.params;
  const currentDate = new Date();
  const weekStartDate = new Date();
  console.log("employeeId is", employeeId);
  weekStartDate.setDate(currentDate.getDate() - currentDate.getDay());
  currentDate.setHours(0);
  currentDate.setMinutes(0);
  currentDate.setSeconds(0);

  const dailyhistories = await WorkHistory.find({
    userId: employeeId,
    startTime: { $gte: currentDate },
  })
  
  const weeklyhistories = await WorkHistory.find({
    userId: employeeId,
    startTime: { $gte: weekStartDate },
  });
  const monthStartDate = new Date();
  monthStartDate.setDate(1);
  const monthlyhistories = await WorkHistory.find({
    userId: employeeId,
    startTime: { $gte: monthStartDate },
  });

  const totalhistories = await WorkHistory.find({ userId: employeeId }).sort({
    startTime: "asc",
  });
  let workDays = 0;
  if (totalhistories && totalhistories.length > 0) {
    workDays = Math.ceil(
      (new Date(totalhistories[totalhistories.length - 1].startTime) -
        new Date(totalhistories[0].startTime)) /
        (1000 * 60 * 60 * 24)
    );
  }

  console.log("workDays is", workDays);


  let dailytotaltime = 0;
  let dailyStartTime = '';
  let dailyEndTime = '';
  if (dailyhistories) {
    dailyhistories.forEach((history) => {
      dailytotaltime += history.endTime - history.startTime;
    });
    dailyStartTime = dailyhistories[0].startTime;
    dailyEndTime = dailyhistories[0].endTime
  } else {
    res.status(404);
  }

  let weeklytotaltime = 0;
  if (weeklyhistories) {
    weeklyhistories.forEach((history) => {
      weeklytotaltime += history.endTime - history.startTime;
    });
  } else {
    res.status(404);
  }

  let weeklyReport = Array(7).fill(0);

  weeklyhistories.forEach((history) => {
    const day = (new Date(history.startTime)).getDay();
    weeklyReport[day] += Math.ceil((history.endTime - history.startTime) / (1000 * 60));
  })


  let monthlytotaltime = 0;
  if (monthlyhistories) {
    monthlyhistories.forEach((history) => {
      monthlytotaltime += history.endTime - history.startTime;
    });
  } else {
    res.status(404);
  }

  

  res.json({
    dailytime: Math.ceil(dailytotaltime / (1000 * 60)),
    weeklyTime: Math.ceil(weeklytotaltime / (1000 * 60)),
    monthlytime: Math.ceil(monthlytotaltime / (1000 * 60)),
    workDays: workDays,
    weeklyReport,
    dailyStartTime,
    dailyEndTime,
  });
  }
  catch(e){
    res.status(500);
  }

};

exports.getScreenshots = async (req, res) => {
  try{
    const {historyId} =req.params;

    const oldHistory = await WorkHistory.findById(historyId);
    if(oldHistory){
      res.json(oldHistory.screenshots);
    }
    else{
      res.status(404)
    }
  }
  catch(err) {
      res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }

}