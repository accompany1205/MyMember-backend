const express = require("express");
const router = express.Router();
const Form = require("../../models/builder/Form.js")

/*
* /builder/view/:formId
*
*
*/
router.get('/:formId', async(req,res) => {
    console.log("FormId: ", req.params.formId)
    
    let form = await Form.findOne({_id: req.params.formId})
    let html = form.formBody
    let css = form.formStyle
    let js = form.formScript
    let title = form.title
     
    /*let html="<div class='s0'>Hello</div><div class='s1'><input type='text' placeholder='hello' class='test'/></div>"
    let css = "body{color: blue; background-color: red;}"
    let js = "console.log('Hi! How are you?')"
    let title = "Form Title"
    */
   
    res.render("index",{
        title: title,
        html: html,
        css: css,
        js: js
    })
})


module.exports = router