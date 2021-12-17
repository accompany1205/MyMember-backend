const mongoose = require("mongoose");
const schema = mongoose.Schema

const smartlistSchema = new schema({
    smartlistname: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    smartlists: {
        type: Array,
    },

    userId: {
        type: String,
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("smartList", smartlistSchema);

