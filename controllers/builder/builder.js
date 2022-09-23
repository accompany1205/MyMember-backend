const Form = require("../../models/builder/Form.js")
const addmember = require("../../models/addmember.js")
const mongoose = require("mongoose")

const stripe = require('stripe')('sk_test_v9')


exports.processStripeConnect = async (req,res) => {
    const accountLink = await stripe.accountLinks.create({
    	account: 'acct_103',
    	refresh_url: 'https://example.com/reauth',
    	return_url: 'https://example.com/return',
    	type: 'account_onboarding'
    })

    const result = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code: req.body.code
    })
    .catch((err) => {
         
    })

    const account = await stripe.accounts
                                ?.retrieve(result?.stripe_user_id)
                                ?.catch((err)=>{
                                    throw error(400, `${err?.message}`)
                                })

}


exports.createForm = async (req,res) => {
    try{
        let formBody = "<html></html>"
        let title = "Form Title"
		let created_by = new mongoose.Types.ObjectId

        let form = new Form
        form.title = title
        form.formBody = formBody
        form.created_by = created_by
        form.formData = JSON.stringify({
                         "gjs-css":"",
                         "gjs-html":"",
                         "gjs-assets":"[]",
                         "gjs-styles":"",
                         "gjs-components":"[ {\"tagName\":\"h1\",\"type\":\"text\",\"attributes\":{\"id\":\"imc6s\"},\"components\":[ {\"type\":\"textnode\",\"content\":\"Form\"} ]}]"
                        })
        //'{{"tagName":"h5","type":"text","attributes":{"id":"imc6s"},"components":[{"type":"textnode","content":"Form"}]}}'
        form.save();

        res.status(200).json({
            success: true,
            message: "Form created successfully",
            formId: form._id,
	        data: "data test"
        })
    }
    catch(error){
		console.log("Error:",error)
        res.status(500).json({
            success: false,
            message: "Error creating form"
        })
    }
}

exports.markAsFavourite = async (req,res) => {
    try{
        let formId = req.params.id 
        console.log("formId::",formId)
        let form = await Form.findOne({_id: formId})
        form.favourite = !form.favourite
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form updated successfully"
        })
       
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Error updating form"
        })
    }
}

exports.getFavourites = async(req,res) => {
    try{
        let forms = await Form.find({favourite: true})

        res.status(200).json({
            success: true,
            message: "Favourite forms fetched successfully",
            forms: forms
        })
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Error marking form as favourite"
        })
    }
}

exports.moveToTrash = async (req,res) => {
    try{
        
        let formId = req.params.id 
        let form = await Form.findOne({_id: formId})
        form.deleted = !form.deleted
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form deleted successfully"
        })
    }
    catch(error){
        console.log("mtt:", error)
        res.status(500).json({
            success: false,
            message: "Error deleting form"
        })
    }
}

exports.deleteForm = async (req,res) => {
    try{
        let formId = req.params.id 
        let form = await Form.findOne({_id: formId})
        await form.delete()

        res.status(200).json({
            success: true,
            message: "Form deleted successfully"
        })
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Error deleting form"
        })
    }
}

exports.archiveForm = async (req,res) => {
    try{
        let formId = req.params.id 
        
        let form = await Form.findOne({_id: formId})
        form.archived = !form.archived
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form updated successfully"
        })
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Error updating form"
        })
    }
}

exports.updateFormData = async (req,res) => {
    try{
        let formId = req.params.id
        let update = {html: req.body.html, css: req.body.css, js: req.body.js, data: req.body.data}
        console.log("formId-2-settings:", formId)

        let form = await Form.findOne({_id: formId})
       
        form.formBody = req.body.html
        form.formStyle = req.body.css
        form.formScript = req.body.js
        form.formData = req.body.data
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form updated successfully"
        })

    }
    catch(error){
       
        res.status(500).json({
            success: false,
            message: "Error updating form"
        })
    }
}

exports.updateFormSettings = async (req,res) => {
    try{
        let formId = req.params.id
        let update = {title: req.body.title, enable: req.body.enabled}
        console.log("updateSettings:", formId, update)
        let enabled = null;
        if(req.body.enabled == "enabled"){
            enabled = true
        }else{
            enabled = false
        }

        let form = await Form.findOne({_id: formId})
        form.title = req.body.title
        form.enabled = enabled
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form updated successfully"
        })

    }
    catch(error){
        console.log("uError:",error)
        res.status(500).json({
            success: false,
            message: "Error updating form"
        })
    }
}



exports.getForms = async (req,res,next) => {
    try{
        let uforms = await Form.find()
		//console.log("getForms:", uforms)
        if(uforms){
            res.status(200).json({
                success: true,
                message: "Forms fetched successfully",
                uforms: uforms
            })
        }
    }
    catch(error){
		console.log("error:",error)
        res.status(500).json({
            success: false,
            message: "Error fetching forms"
        })
    }
}

exports.storeForm = async(req,res,next) => {
	try{
	     console.log("storeForm-1:::", req.body)
             res.status(200).json({test: "store form"})
        }
        catch(error){
            console.log("storeForm::", error)
	    res.status(500).json({
            	success: false,
            	message: "Error storing form"
            })
        }
}

exports.loadForm = async(req,res,next) => {
	try{
	     console.log("loadForm:::", req.body)
             res.status(200).json({test: "load form"})
        }
        catch(error){
            console.log("loadForm::", error)
	    res.status(500).json({
            	success: false,
            	message: "Error loading form"
            })
        }
}

exports.getForm = async(req,res,next)=>{
	try{
		let formId = req.params.id
		let uform = await Form.findOne({_id: formId})
		if(uform){
			res.status(200).json({
		          success: true,
		         message: "Form fetched successfully",
		         uform: uform
		       })
		}
	}
	catch(error){
		console.log("error:",error)
        res.status(500).json({
            success: false,
            message: "Error fetching form:id"
        })
	}
}


exports.processForm = async(req,res) => {
    
    try{
	    console.log("Processing Form")
	    console.log("Req.body::", req.body)

	    let formId = req.params.id
	    let userId = req.params.userId

	    //Contact Info
	    let memberType = req.body.member_type
	    let memberId = req.body.memberId

	    // Member Info
	    let firstName = req.body.first_name
	    let lastName = req.body.last_name
	    let gender = req.body.gender
	    let dob = req.body.dob
	    let age = req.body.age
	    let street = req.body.street
	    let city = req.body.city
	    let state = req.body.state
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

	    let newmember = await addmember
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

	    await newmember.save()  
     }catch(error){
         console.log("Err:",error)
     }  
    
}

