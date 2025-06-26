// Post Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema ({
    title:{type:String, required:true,maxLength:100},
    content: {type: String, required:true},
    linkFlairID: {type: Schema.Types.ObjectId, ref: 'LinkFlairs'},
    postedBy: {type: String, required:true},
    postedDate: {type:Date, default: Date.now, required: true},
    commentIDs: { type: [{type: Schema.Types.ObjectId, ref: 'Comments'}], default: [] },
    views: {type:Number, default: 0, required:true},
    vote: {type: Number, default:0},
    upvotedBy: [{type: Schema.Types.ObjectId, ref: 'User'}],
    downvotedBy: [{type: Schema.Types.ObjectId, ref: 'User'}],
});

// defining virtual url
PostSchema.virtual('url').get(function () {
    return `posts/${this._id}`;
});

//Export model
module.exports = mongoose.model('Post', PostSchema);