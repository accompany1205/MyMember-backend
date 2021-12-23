const express = require('express');
const router = express.Router();
const upload = require('../handler/multer');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

const { userById, read, update, purchaseHistory, deleteUser,deleteMultiple_User, verificationLink, listingVerifications, deleteVerifiedSendgridUser } = require('../controllers/user');

router.get('/secret', requireSignin, (req, res) => {
    res.json({
        user: 'got here yay'
    });
});

router.get('/user/:userId', requireSignin, read);
router.delete('/deleteUser/:userId', requireSignin, isAuth, deleteUser);
router.delete('/delete_MultipleUser/:userId', requireSignin, isAuth, deleteMultiple_User);

router.put('/user/:userId', upload.single('profile_image'), requireSignin, isAuth, update);
router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory);
router.put('/sendgridverification/emails/:userId', requireSignin, verificationLink)
router.get('/getsendgridverification/:userId', requireSignin, listingVerifications)
router.delete('/delete/verifiedsendgriduser/:email', requireSignin, deleteVerifiedSendgridUser)

router.param('userId', userById);

module.exports = router;
