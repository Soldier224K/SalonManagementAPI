const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer is required']
    },
    stylist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stylist',
        required: [true, 'Stylist is required']
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'At least one service is required']
    }],
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    totalAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
