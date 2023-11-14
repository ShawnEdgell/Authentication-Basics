const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    membershipStatus: { type: Boolean, default: false },
    admin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
