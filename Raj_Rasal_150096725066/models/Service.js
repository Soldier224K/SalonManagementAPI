const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Hair Care', 'Skin Care', 'Nail Care', 'Spa & Massage', 'Bridal & Makeup', 'Beard & Grooming', 'Other'],
        default: 'Hair Care'
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    durationMinutes: {
        type: Number,
        required: [true, 'Duration in minutes is required'],
        min: [5, 'Duration must be at least 5 minutes'],
        default: 30
    },
    targetGender: {
        type: String,
        enum: ['Male', 'Female', 'Unisex'],
        default: 'Unisex'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
