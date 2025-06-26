// Comment Document Schema
//Import the mongoose module 
//Define schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentsSchema = new Schema ({
   content: {type: String, required:true, maxLength: 500},
   commentIDs: { type: [{type: Schema.Types.ObjectId, ref: 'Comments'}], default: [] },
   //    commentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments', default: [] }],
   commentedBy:{type: String, required:true},
   commentedDate: {type:Date, default: Date.now, required:true},
   vote: {type:Number, default:0},
   upvotedBy: [{type: Schema.Types.ObjectId, ref: 'User'}],
   downvotedBy: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

// defining virtual url
CommentsSchema.virtual('url').get(function () {
   return `comments/${this._id}`;
});

//Export model
module.exports = mongoose.model('Comments', CommentsSchema);