const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    _id: {
        select: false,
        type: ObjectId,
        default: mongoose.Types.ObjectId,
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false, required: true, unique: true },
    ismentor: { type: Boolean, default: false },
    img: { type: String },
});

module.exports = mongoose.model("users", userSchema);
