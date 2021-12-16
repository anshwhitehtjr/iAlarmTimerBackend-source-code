const mongoose = require('mongoose');

const AlarmSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    desc: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        default: Date.now,
        required: true
    },
    state: {
        type: String,
        default: 'disabled',
    },
    hour: {
        type: mongoose.Schema.Types.Number,
        default: 0,
        required: true
    },
    min: {
        type: mongoose.Schema.Types.Number,
        default: 0,
        required: true
    },
    sec: {
        type: mongoose.Schema.Types.Number,
        default: 0,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Alarm = mongoose.model('alarms', AlarmSchema);
module.exports = Alarm;
