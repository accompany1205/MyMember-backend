const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
    {
        activeStudentValue: {
            type: String
        },
        activeStudentType: {
            type: String
        },

        leadsValue: {
            type: String
        },
        leadsType: {
            type: String
        },

        acticeTrialsValue: {
            type: String
        },
        acticeTrialsType: {
            type: String
        },

        newStudentsValue: {
            type: String
        },
        newStudentsType: {
            type: String
        },

        newBBCValue: {
            type: String
        },
        newBBCType: {
            type: String
        },

        newLCValue: {
            type: String
        },
        newLCType: {
            type: String
        },

        newICValue: {
            type: String
        },
        newICType: {
            type: String
        },

        newMCValue: {
            type: String
        },
        newMCType: {
            type: String
        },

        birthdayBooked01Value: {
            type: String
        },
        birthdayBooked01Type: {
            type: String
        },

        birthdayBooked02Value: {
            type: String
        },
        birthdayBooked02Type: {
            type: String
        },

        birthdayBooked03Value: {
            type: String
        },
        birthdayBooked03Type: {
            type: String
        },

        birthdayBooked04Value: {
            type: String
        },
        birthdayBooked04Type: {
            type: String
        },

        grossIncomeValue: {
            type: String
        },
        grossIncomeType: {
            type: String
        },

        BBCIncomeValue: {
            type: String
        },
        BBCIncomeType: {
            type: String
        },

        LC_IC_MC_IncomeValue: {
            type: String
        },
        LC_IC_MC_IncomeType: {
            type: String
        },

        campIncomeValue: {
            type: String
        },
        campIncomeType: {
            type: String
        },

        afterSchoolIncomeValue: {
            type: String
        },
        afterSchoolIncomeType: {
            type: String
        },

        annualGrossIncomeValue: {
            type: String
        },
        annualGrossIncomeType: {
            type: String
        },

        personalIncomeValue: {
            type: String
        },
        personalIncomeType: {
            type: String
        },

        saveValue: {
            type: String
        },
        saveType: {
            type: String
        },

        userId: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("GoalSetting", EventSchema);
