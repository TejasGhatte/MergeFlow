const mongoose = require("mongoose");

try {
    mongoose.connect('DATABASE_URL');
} catch (error) {
    console.log(error)
}

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required: true
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})


const configSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title:{
        type:String,
        required:true
    },
    sheetlink:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    cardlink:{
        type: String
    },
    htmlTemp:{
        type:String,
        required:true
    }
})

const User = mongoose.model('User', userSchema);
const Config = mongoose.model('Config', configSchema);

module.exports = {
    User,
    Config
}
