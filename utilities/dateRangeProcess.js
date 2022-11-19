const moment = require("moment");

function dateParser(date) {
  return isNaN(parseInt(date)) ? moment(date) : parseInt(date);
}

module.exports.dateRangeBuild = (startDate, endDate) => {
  const _d_start = new Date(dateParser(startDate))
    .toLocaleDateString(`fr-CA`)
    .split("/")
    .join("-");
  const _d_end = new Date(dateParser(endDate))
    .toLocaleDateString(`fr-CA`)
    .split("/")
    .join("-");

  return {
    start: new Date(`${_d_start}T00:00:00.00Z`),
    end: new Date(`${_d_end}T23:59:59.999Z`),
  };
};
// 14
