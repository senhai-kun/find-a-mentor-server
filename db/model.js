const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

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
    },
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String},
    phone: { type: String },
    birthday: { type: String },
    img: { type: String, default: "no_image" },
    ref_id: { type: String },
    coordinates: { 
        lng: Number,
        lat: Number,
        address: String
    }
})

const mentorSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId,
    },
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String},
    phone: { type: String },
    birthday: { type: String },
    img: { type: String, default: "no_image" },
    details: { 
        skills: { type: Array },
        about: { type: String },
        rating: {
            rate: {
                type: Number,
                default: 0
            },
            rated: {
                type: Boolean,
                default: false
            },
            total_count: {
                type: Number,
                default: 0
            }
        }
    },
    profession: { type: String },
    ref_id: { type: String },
    coordinates: { 
        lat: Number,
        lng: Number,
        address: String
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
            status: {
                mode: {
                    type: String,
                    default: "pending"
                },
                message: {
                    type: String,
                    default: ""
                }
            },
            _id: {
                type: Schema.Types.ObjectId,
                ref: 'mentee',
                required: true
            },
            schedule: [{
                _id: {
                    type: Schema.Types.ObjectId,
                    ref: "schedule"
                }
            }]
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
    approved: {
        type: Boolean,
        default: false
    },
    done: {
        type: Boolean,
        default: false
    },
    cancel: {
        type: Boolean,
        default: false
    },
    rating: {
        rate: {
            type: Number,
            default: 0
        },
        rated: {
            type: Boolean,
            default: false
        }
    }
})

const messageSchema = new Schema({
    room_id: {
        type: String
    },
    messages: [{
        message: {
            type: String,
            required: true
        },
        sender: {
            type: String
        },
        img: {
            type: String
        },
        date: {
            type: String
        },
    }]
    
})

const UsersAccount = mongoose.model("users_account", usersAccount, "users_account");
const Mentee = mongoose.model("mentee", menteeSchema, "mentee");
const Mentor = mongoose.model("mentor", mentorSchema, "mentor");
const MentoringList = mongoose.model("mentoring_list", mentoringListSchema, "mentoring_list");
const Schedule = mongoose.model("schedule", scheduleSchema, "schedule");
const Message = mongoose.model("message", messageSchema, "message")

module.exports = { Mentee, Mentor, UsersAccount, MentoringList, Schedule, Message };
