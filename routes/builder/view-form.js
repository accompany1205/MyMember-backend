const express = require("express");
const router = express.Router();
const Form = require("../../models/builder/Form.js")
const addmember = require("../../models/addmember.js")

/*
* /builder/view/:formId
*
*
*/
router.get('/:formId', async(req,res) => {
    console.log("FormID: ", req.params.formId)
    
    let id = req.params.formId
    let form = await Form.findOne({_id: req.params.formId})
    let html = form.formBody
    html = html.replace('<body>', '<body><form method="post" action="/builder/view/process/newstudent/'+ id +'">')
    html = html.replace('</body>', '</form></body>')
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

router.post("/process/newstudent/:formId", async(req,res) => {
        let formId = req.params.formId
    
        try{
            console.log("Processing Form")
            console.log("Req.body::", req.body)
    
            let formId = req.params.formId
            let userId = req.params.userId
    
            //Contact Info
            let memberType = req.body.member_type
            let memberId = req.body.memberId
    
            // Member Info
            let firstName = req.body.firstname
            let lastName = req.body.lastname
            let gender = req.body.gender
            let dob = req.body.dob
            let age = req.body.age
            let street = req.body.street
            let city = req.body.city
            let state = req.body.state
            let postal = req.body.postal
            let zipCode = req.body.zipcode
            let country = req.body.country
            let phone1 = req.body.phone
            let phone2 = req.body.phone2
            let email = req.body.email
    
            //Buyer Info
            let buyerFirstName = req.body.first_name2
            let buyerLastName = req.body.last_name2
            let buyerGender = req.body.gender2
            let buyerDob = req.body.dob2
            let buyerAge = req.body.age2
    
            //custom info
            let leadsTracing = req.body.leads
    
            let form = await Form.findOne({_id: formId})
            form.submission += 1
            await form.save()
    
            let newmember = await addmember()
            newmember.studentType = memberType
            newmember.firstName = firstName
            newmember.lastName = lastName
            newmember.dob = dob
            newmember.age = age
            newmember.gender = gender
            newmember.email = email
            newmember.primaryPhone = phone1
            newmember.secondaryPhone = phone2
            newmember.street = street
            newmember.city = city
            newmember.state = state
            newmember.country = country
            newmember.zipPostalCode = zipCode
    
            newmember.buyerInfo.firstName = buyerFirstName
            newmember.buyerInfo.lastName = buyerLastName
            newmember.buyerInfo.gender = buyerGender
            newmember.buyerInfo.dob = buyerDob
            newmember.buyerInfo.age = buyerAge

            console.log("newmember:::", newmember)
            res.render("/success",{
               status: "Form Submitted Successfully",
               formId: formId
            })

           

            //res.sendFile()
    
            //await newmember.save()  
         }catch(error){
             console.log("Err:",error)

             res.render("/error",{
                formId: formId
            })
         }  

})


module.exports = router