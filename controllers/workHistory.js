const WorkHistory = require("../models/workHistory");
const user = require("../models/user");
const { errorHandler } = require("../helpers/dbErrorHandler");
const url = require("url");

exports.getWorkHistory = (req, res) => {
  const { employeeId } = req.params;
  const histories = WorkHistory.find({ userId: employeeId })
    .then((result) => {
      res.json(result);
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
