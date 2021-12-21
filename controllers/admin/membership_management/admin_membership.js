// const membershipModal = require("../../../models/membership");
// const membershipFolder = require("../../../models/membershipFolder");
// const User = require('../../../models/user')

// exports.assign_membership = async (req, res) => {
//     try {

//         let userId = await User.aggregate([
//             {
//                 $group: { _id: "", userIds: { $push: "$_id" } }
//             },
//             {
//                 $project:
//                 {
//                     _id: 0,
//                     userIds: 1,
//                 },
//             },
//         ])
//         res.send(userId)
//     } catch (err) {  
//         res.send({ error: err.message.replace(/\"/g, ""), success: false });
//     }

// }