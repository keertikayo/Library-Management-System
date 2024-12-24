

const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/user_data",)
.then(() => {
    console.log('MongoDB connected successfully to database: book_data');
})
.catch(err => {
    console.error('Detailed MongoDB Connection Error:', err);
});

const Books_schema = new mongoose.Schema({
    bookTitle: {
        type: String,
        required: true
    },
    bookID:{
        type:Number,
        required: true,
        unique :true
    },
    issueStatus: {
        type: Boolean,
        required: false,
        default : false
    },
    username: {
        type: String
    },
    date:{
        type: Date
    }
    

});

const Books_collection = mongoose.model("Books", Books_schema)


module.exports = Books_collection;
