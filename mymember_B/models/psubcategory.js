const mongoose = require("mongoose");
var schema = mongoose.Schema;
var psubcategorySchema = new schema(
    {
      pName:{
          type:String
      },
      cId:{
          type:String
      },
           
     subcategory:{
            type: String,
     },
     lable:{
            type:String,
         
      },
     color:{
            type:String,
          },
    
    },
);

module.exports = mongoose.model("psubcat", psubcategorySchema);
