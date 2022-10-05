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

const usersAccount = new Schema({
    _id: {
        type: ObjectId,
        default: mongoose.Types.ObjectId,
        // select: false,
        refPath: "accountType"
    },  
    accountType: {
        type: "String",
        required: true,
        enum: ['mentee', 'mentor']
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false, required: true },
})

const menteeSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId,
        // select: false,
    },
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String},
    img: { type: String, default: "no_image" },
    ref_id: { type: String },
    coordinates: { 
        lng: Number,
        lat: Number
    }
})

const mentorSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId,
        // select: false,
    },
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String},
    img: { type: String, default: "no_image" },
    details: { 
        skills: { type: Array },
        about: { type: String },
        ratings: { type: Number, default: 0 }
    },
    profession: { type: String },
    ref_id: { type: String },
    coordinates: { 
        lat: Number,
        lng: Number
    }
})

const mentoringListSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId,
        ref: "mentor"
    },
    mentee: [
        { 
            _id: {
                type: Schema.Types.ObjectId,
                ref: 'mentee',
                required: true
            },
            schedule: {
                type: Schema.Types.ObjectId,
                ref: "schedule"
            }
        }
    ]
    
})

const scheduleSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId,
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    mentee: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'mentee',
        },
    },
    approved: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model("users", userSchema);
const UsersAccount = mongoose.model("users_account", usersAccount, "users_account");
const Mentee = mongoose.model("mentee", menteeSchema, "mentee");
const Mentor = mongoose.model("mentor", mentorSchema, "mentor");
const MentoringList = mongoose.model("mentoring_list", mentoringListSchema, "mentoring_list");
const Schedule = mongoose.model("schedule", scheduleSchema, "schedule");

module.exports = { User, Mentee, Mentor, UsersAccount, MentoringList, Schedule };
