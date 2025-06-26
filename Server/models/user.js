const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema (
    {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        email: {type: String, required: true, unique:true},
        displayName: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        reputation: {type: Number, required: true},
        isAdmin: {type: Boolean, default: false}
    },
    { timestamps: true }
);

module.exports = mongoose.model('Users', UserSchema);