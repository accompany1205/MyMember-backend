const mongoose = require("mongoose");
const schema = mongoose.Schema
const addmemberSchema = new schema(
    {
        studentType:{
            type:String
            
        },
        firstName:{
            type:String
            
        },
        lastName:{
            type:String
            
        },
        status:{
            type: String
            
        },
        days_expire:{
            type:String,
            default:' '
        },
        dob:{
            type:Date
            
        },
        day_left:{
            type:String,
            default:' '
        },
        age:{
            type:String
        },
        gender:{
            type:String
            
        },
        email:{
            type:String
         },
        primaryPhone:{
            type:String
        },
        secondaryNumber:{
            type:String
        },
        address:{
            type:String
        },
        country:{
            type:String
        },
        state:{
            type:String
        },
        zipPostalCode:{
            type:String
        },
        notes:{
            type:String
        },
        studentBeltSize:{
            type:String
        },
        program:{
            type:String    
        },
        programColor:{
            type:String
        },
        programID:{
            type:String
        },
        manage_change_rank:[{
            type:schema.Types.ObjectId,
            ref:'manage_change_rank'
        }],
        next_rank_id:{
            type:String
        },
        next_rank_name:{
            type:String
        },
        next_rank_img:{
            type:String
        },
        current_rank_name:{
            type:String,
            default:""
        },
        current_rank_img:{
            type:String,
            default:""
        },
        current_rank_id:{
            type:String,
            default:""
        },
        category:{
            type:String    
        },
        subcategory:{
            type:String    
        },
        belt_rank_img:{
            type:String
        },
        belt_rank_name:{
            type:String
        },
        location:{
            type:String
        },
        customId:{
            type:String
        },
        leadsTracking:{
            type:String
        },
        staff:{
            type:String   
        },
        intrested:{
            type:String
        },
        school:{
            type:String
        },
        memberprofileImage:{
            type:String,
            default:' '
        },
        rating:{
            type:Number,
            default:0
        },
        attendence_color:{
            type:String,
            default:'#FF0000'
        },
        class_count:{
            type:Number,
            default:0
        },
        attendence_status:{
            type:Boolean,
            default:false
        },
        userId:{
            type:String
        },
        membership_details:[{
                type:schema.Types.ObjectId,
                ref:'Buy_Membership'
            }],
        finance_details:[{
                type:schema.Types.ObjectId,
                ref:'FinanceInfo'
            }],
        myFaimly:[{
                type:schema.Types.ObjectId,
                ref:'family'
            }],
        myGroup:[{
                type:schema.Types.ObjectId,
                ref:'myGroup'
            }],
        test_purchasing:[{
            type:schema.Types.ObjectId,
            ref:'testpurchase'
        }],
        renewals_notes:[{
            type:schema.Types.ObjectId,
            ref:'renewalNote'
        }],
        birthday_notes:[{
            type:schema.Types.ObjectId,
            ref:'birthdayNote'
        }],
        birthday_checklist:[{
            type:schema.Types.ObjectId,
            ref:'birthdaycheckList'
        }],
        last_contact_missCall:{
            type:Date
        },
        missYouCall_notes:[{
            type:schema.Types.ObjectId,
            ref:'missYouCallNote'
        }]
    },
    { timestamps:true }   
);

module.exports = mongoose.model("member", addmemberSchema);
