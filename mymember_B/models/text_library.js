const mongoose = require('mongoose');
const schema =  mongoose.Schema
const textLibrarySchema = schema({
   categoryName:{
       type:String,
       require:true
   },
   category:{
    type:String,
    default:'library'
   },
   folder:[{
       type:schema.Types.ObjectId,
       ref:'txt_library_Folder'
   }],
   userId:{
       type:String 
   }
},
{ timestamps:true }
)

module.exports = mongoose.model('txt_library_cat', textLibrarySchema)