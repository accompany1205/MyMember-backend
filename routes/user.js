const express = require('express');
const router = express.Router();
const upload = require('../handler/multer');
const User = require('../models/user');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

const { userById, read, update, purchaseHistory, deleteUser, deleteMultiple_User, verificationLink, listingVerifications, deleteVerifiedSendgridUser, mergeUserInfo, userSignatureUpdate, purchased_Num, Subtract_Credits, Add_Credits, AddNew_Credits, userByPakage,socialAuth } = require('../controllers/user');

router.get('/secret', requireSignin, (req, res) => {
    res.json({
        user: 'got here yay'
    });
});

router.get('/user/:userId', requireSignin, isAuth, read);
router.delete('/deleteUser/:userId', requireSignin, isAuth, deleteUser);
router.delete('/delete_MultipleUser/:userId', requireSignin, isAuth, deleteMultiple_User);
router.put('/user/updateSignature/:userId', requireSignin, userSignatureUpdate);

router.put('/user/:userId', upload.single('profile_image'), requireSignin, isAuth, update);
router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory);
router.put('/sendgridverification/emails/:userId', requireSignin, verificationLink)
router.get('/getsendgridverification/:userId', requireSignin, listingVerifications)
router.delete('/delete/verifiedsendgriduser/:userId/:email', requireSignin, deleteVerifiedSendgridUser)

router.param('userId', userById);
router.post('/mergeUserInfo/:userId', requireSignin, isAuth, mergeUserInfo);
router.put('/purchase_num/:userid', purchased_Num)
router.put('/credits/:userid', Subtract_Credits)
router.put('/Addcredits/:userid', Add_Credits)
router.post('/addNewCredits', AddNew_Credits)
//  router.post("/getPakge/:userid", userByPakage)
router.put('/facebookGooglekey/:userId',requireSignin, socialAuth)

router.post("/getPakge/:userid", (req, res) => {
    console.log('call here', req.params)
    //      User.findOne({_id:req.params.userid }, function (err, item) {
    //     res.json({ success: true, data: item })
    //   })
    User.find({
        _id: req.params.userid
    })
        .populate('userPakages' , "credits")
        .exec((err, data) => {
            if (err) {
                res.send({
                    msg: "No record found",
                    success: false,
                });
            } else {
                if (data.length > 0) {
                    res.send({ data: data, success: true });
                } else {
                    res.send({
                        msg: "No record found",
                        success: false,
                    });
                }
            }
        });
})
module.exports = router; 
