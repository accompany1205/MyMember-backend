const mongoose = require('mongoose');
const schema =  mongoose.Schema

const currentSchema = schema({
    name:{
        type:String
    },
    createdAt: { type: Date, expires: '1m', default: Date.now }
});

// currentSchema.index({createdAt: 1},{expireAfterSeconds: 60});

module.exports = mongoose.model('ttl', currentSchema)