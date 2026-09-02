const mongoose = require('mongoose');

const stylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Stylist name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    specialties: [{
        type: String,
        trim: true
    }],
    experienceYears: {
        type: Number,
        default: 1,
        min: 0
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    workingHours: {
        start: {
            type: String,
            default: '09:00'
        },
        end: {
            type: String,
            default: '19:00'
        }
    },
    daysAvailable: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Stylist', stylistSchema);
