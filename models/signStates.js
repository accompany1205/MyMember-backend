const mongoose = require("mongoose");
const schema = mongoose.Schema;

const valueSchema = schema(
    {
        ipAdderss: {
            type: String
        },
        signer: {
            type: String
        },
        email: {
            type: String
        },
        signerType: {
            type: String
        },
        x: {
            type: Number
        },
        y: {
            type: Number
        },
        signValue: {
            type: String
        }
    }
);


const signersSchema = schema(
    {
        owner: {
            type: Object,
            value: [valueSchema]
        },
        invite: {
            type: Object,
            value: [valueSchema]
        }
    },
    { _id: false }
);

// const statusTopSchema = schema(
//     {
//         viewed: {
//             type: Date
//         },
//         signed: {
//             type: Date
//         }

//     }
// );

const signStatesSchema = schema(
    {
        signDocFor: {
            type: String
        },
        isDone:{
            type: Boolean,
            default: false
        },
        items: signersSchema,
        viewed: {
            type: Array
        },
        signDocForId: {
            type: String
        },
        userId: {
            type: String
        }
    },
    { timestamps: true }
);



module.exports = mongoose.model("signStates", signStatesSchema);