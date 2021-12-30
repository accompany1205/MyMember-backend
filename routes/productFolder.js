const express = require('express');
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const {addproductFolder, getproductFolder, updateproductFolder, deleteproductFolder} = require("../controllers/productFolder")


router.post('/addproductfolder/:userId', requireSignin, addproductFolder);
router.get('/getproductfolder/:userId', requireSignin, getproductFolder);
router.put('/updateproductFolder/:userId/:folderId', requireSignin, updateproductFolder);
router.delete('/deleteproductFolder/:userId/:folderId', requireSignin, deleteproductFolder);

module.exports = router