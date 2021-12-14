const leadsTracking=require('../models/leads_tracking')

exports.get_leads=async(req,res)=>{
try{
    let userId=req.params.userId
    if (!userId) {
      return  res.json({
            success: false,
            msg: "Please give the userId  in params!"
        })}
        
        let  leads_data=await leadsTracking.find({userId:userId})
        res.send({data:leads_data, success: true });
}catch(err){
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
}
}

exports.create_leads=async(req,res)=>{
    try{
    let userId=req.params.userId
    if (!userId) {
        res.json({
            success: false,
            msg: "Please give the userId  in params!"
        })}
        let leads_body=leadsTracking({
            leads_category:req.body.leads_category,
            userId:userId
        })
    await   leads_body.save((err,leads_data)=>{
            if(err){
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

            } else{
     return    res.send({msg:"leads created successfully", success: true });
            }
        })
    
    }catch(err){
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    
    } 
}

exports.remove_leads=async(req,res)=>{
        try{
            let leadsId=req.params.leadsId
    if ( !leadsId) {
        res.json({
            success: false,
            msg: "Please give the leadsId  in params!"
        })}
        await  leadsTracking.findByIdAndRemove(leadsId,
        ((err,leads_data)=>{
            if(err){
    return  res.send({ error: err.message.replace(/\"/g, ""), success: false });

            } else{
     return    res.send({msg:"leads deleted successfully", success: true });
            }
        }))

        }catch(err){
            res.send({ error: err.message.replace(/\"/g, ""), success: false });
     }
}

exports.Update_leads=async(req,res)=>{
            try{
                let leadsId=req.params.leadsId
                if ( !leadsId) {
                    res.json({
                        success: false,
                        msg: "Please give the leadsId  in params!"
                    })}
                    await  leadsTracking.findByIdAndUpdate(leadsId,req.body,
                    ((err,leads_data)=>{
                        if(err){
                    res.send({ error: err.message.replace(/\"/g, ""), success: false });
            
                        } else{
                 return    res.send({msg:"leads updated successfully", success: true });
                        }
                    }))
            }catch(err){
                res.send({ error: err.message.replace(/\"/g, ""), success: false });
            
            }
            
            }

