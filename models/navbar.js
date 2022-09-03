const mongoose = require('mongoose')
const schema = mongoose.Schema

const EventSchema = new schema({
    user_id: {
        type: String,
        index:true
    }
    ,

    ui: {
        type: String
    },
    li: {
        type: Array
    }

})

module.exports = mongoose.model('navbar', EventSchema)