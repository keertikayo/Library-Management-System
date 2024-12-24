

const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/user_data",)
.then(() => {
    console.log('MongoDB connected successfully to database: user_data');
})
.catch(err => {
    console.error('Detailed MongoDB Connection Error:', err);
});

const Students_schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique:true
    },
    email:{
        type:String,
        required: true,
        unique :true
    },
    password: {
        type: String,
        required: true
    }
    

});

const Student_collection = mongoose.model("Students", Students_schema)


module.exports = Student_collection;
