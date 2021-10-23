const mongoose = require('mongoose');

const prefrencesSchema = new mongoose.Schema({

    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},

    schedule:[
        {
            day : {type : String, required: true, enum:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
        "Sunday"]},

            slots : [[Number]]
        }
    ],
    
    blcokedApps : [String],
    

    restrictedApps : [
        {
           name : String,
           weekDayLimit : Number,
           weekEndLimit : Number 
        }
    ]

})

const Prefrences = new mongoose.model("Prefrences",prefrencesSchema);
module.exports = Prefrences;