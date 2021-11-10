const express = require("express");
const router = express.Router();
const ttlModal  = require("../models/attl")

router.post("/ttl_index",(req,res)=>{
    var ttlObj = new ttlModal(req.body)
    ttlObj.save((err,resp)=>{
        if(err){
            res.send('ttl data not save')
        }else{
            res.send('ttl data save successfully')
        }
    })
})


module.exports = router;