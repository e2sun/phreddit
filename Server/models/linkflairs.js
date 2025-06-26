// LinkFlair Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const mongoDB = 'mongodb://127.0.0.1/phreddit';
// mongoose.connect(mongoDB);

// //Bind connection to error event (to get notification of connection errors)
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error'));


const LinkFlairsSchema = new Schema ({
    content: {type:String, maxLength: 30},
});

// defining virtual url
LinkFlairsSchema.virtual('url').get(function () {
    return `linkFlairs/${this._id}`;
});

//Export model
module.exports = mongoose.model('LinkFlairs', LinkFlairsSchema);