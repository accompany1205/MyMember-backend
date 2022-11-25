const summer_camp = require("../models/summer_camp");
const SubUserRoles = require("../models/sub_user_roles");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const sub_user = await SubUserRoles.findOne({ email: email });
  if (!sub_user) {
    res.status(404).send({ error: "Sub user not found", status: false });
    return;
  }
  if (sub_user.password === password)
    res
      .json({
        sucess: true,
        data: sub_user,
      })
      .status(200);
  else
    res.status(401).send({ error: "password is not correct", status: false });
};
