const Form = require("../../models/builder/Form.js")
const addmember = require("../../models/addmember.js")


exports.viewForm = async(req,res) => {

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

}


exports.processForm = async(req,res) => {

    let formId = req.params.formId

    try{
        console.log("Processing Form")
        console.log("Req.body::", req.body)
        console.log("first-name::", typeof(req.body.firstname), req.body.firstname[0], req.body.firstname[1])

        console.log("req.body::",Array.isArray(req.body.firstname) )

        let formId = req.params.formId
        let userId = req.params.userId

        //Contact Info
        let memberType = req.body.memberTyp
        let memberId = req.body.memberId

        // Member Info
        let firstName =  (req.body.firstname && Array.isArray(req.body.firstname) ) ? req.body.firstname[0] : req.body.firstname
        let lastName =  (req.body.lastname && Array.isArray(req.body.lastname) ) ? req.body.lastname[0] : req.body.lastname
        let gender = (req.body.gender && Array.isArray(req.body.gender) ) ? req.body.gender[0] : req.body.gender
        let dob = (req.body.dob && Array.isArray(req.body.dob) ) ? req.body.dob[0] : req.body.dob
        let age = (req.body.age && Array.isArray(req.body.age) ) ? req.body.age[0] : req.body.age
        let street = req.body.street
        let city = req.body.city
        let state = req.body.state
        let postal = req.body.postal
        let zipCode = req.body.zipcode
        let country = req.body.country
        let phone1 =  (req.body.phone && Array.isArray(req.body.phone) ) ? req.body.phone[0] : req.body.phone
        let phone2 =  (req.body.phone && Array.isArray(req.body.phone) ) ? req.body.phone[1] : req.body.phone
        let email = req.body.email

        //Buyer Info
        let buyerFirstName = (req.body.firstname && Array.isArray( req.body.firstname)) ? req.body.firstname[1] : req.body.firstname
        let buyerLastName = (req.body.lastname && Array.isArray(req.body.lastname)) ? req.body.lastname[1] : req.body.lastname
        let buyerGender = (req.body.gender && Array.isArray(req.body.gender)) ? req.body.gender[1] : req.body.gender
        let buyerDob = (req.body.dob && Array.isArray(req.body.dob)) ? req.body.dob[1] : req.body.dob
        let buyerAge = (req.body.age && Array.isArray(req.body.age)) ? req.body.age[1] : req.body.age

        //custom info
        let leadsTracing = req.body.leads

        let form = await Form.findOne({_id: formId})
        form.number_of_submissions += 1
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

        //await newmember.save() 

        console.log("newmember:::", newmember)
        res.render("success",{
           status: "Form Submitted Successfully",
           formId: formId
        })

        //res.sendFile()

         
     }catch(error){
         console.log("Err:",error)

         res.render("error",{
            formId: formId
        })
     }

}