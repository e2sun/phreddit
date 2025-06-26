// Community Document Schema
//Import the mongoose module 
//Define schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommunitySchema = new Schema ({
    name:{type:String, required:true,maxLength:100},
    description: {type: String, required: true, maxLength:500},
    postIDs: { type: [{type: Schema.Types.ObjectId, ref: 'Posts'}], default: [] },
    startDate: {type:Date, default: Date.now, required:true},
    members: [{type:String, required:true}],
    creator: [{type: String, required: true}]
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// defining virtual url
CommunitySchema.virtual('url').get(function () {
    return `communities/${this._id}`;
});

CommunitySchema.virtual('memberCount').get(function() {
    return this.members.length;
})

//Export model
module.exports = mongoose.model('Community', CommunitySchema);