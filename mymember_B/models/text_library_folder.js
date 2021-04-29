const mongoose = require('mongoose');
const schema =  mongoose.Schema
const txtLibraryFolder = schema({
   folderName:{
       type:String,
       require:true
   },
   template:[{
    type:schema.Types.ObjectId,
    ref:'sent_schedule_text'
}]
},
{ timestamps:true }
)

module.exports = mongoose.model('txt_library_Folder', txtLibraryFolder)