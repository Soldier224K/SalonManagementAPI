const express = require('express');
const router = express.Router();
const Stylist = require('../models/Stylist');
const Appointment = require('../models/Appointment');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route   GET /api/stylists
// @desc    Get all stylists (supports filtering by availability, specialty, minRating, search)
router.get('/', async (req, res) => {
    try {
        const { isAvailable, specialty, minRating, search } = req.query;
        let query = {};

        if (isAvailable !== undefined) {
            query.isAvailable = isAvailable === 'true';
        }

        if (specialty) {
            query.specialties = { $regex: escapeRegex(specialty.trim()), $options: 'i' };
        }

        if (minRating) {
            query.rating = { $gte: Number(minRating) };
        }

        if (search) {
            const escaped = escapeRegex(search.trim());
            query.$or = [
                { name: { $regex: escaped, $options: 'i' } },
                { email: { $regex: escaped, $options: 'i' } },
                { phone: { $regex: escaped, $options: 'i' } }
            ];
        }

        const stylists = await Stylist.find(query).sort({ rating: -1, name: 1 });
        res.status(200).json({
            success: true,
            count: stylists.length,
            data: stylists
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/stylists/:id
// @desc    Get single stylist by ID
router.get('/:id', async (req, res) => {
    try {
        const stylist = await Stylist.findById(req.params.id);
        if (!stylist) {
            return res.status(404).json({ success: false, message: 'Stylist not found' });
        }
        res.status(200).json({ success: true, data: stylist });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/stylists/:id/appointments
// @desc    Get all appointments for a specific stylist
router.get('/:id/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find({ stylist: req.params.id })
            .populate('customer', 'name email phone')
            .populate('services', 'name price durationMinutes')
            .sort({ appointmentDate: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/stylists
// @desc    Register a new stylist
router.post('/', async (req, res) => {
    try {
        const stylist = new Stylist(req.body);
        await stylist.save();
        res.status(201).json({ success: true, message: 'Stylist registered successfully', data: stylist });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/stylists/:id
// @desc    Update stylist profile
router.put('/:id', async (req, res) => {
    try {
        const stylist = await Stylist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!stylist) {
            return res.status(404).json({ success: false, message: 'Stylist not found' });
        }
        res.status(200).json({ success: true, message: 'Stylist profile updated successfully', data: stylist });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/stylists/:id/availability
// @desc    Toggle stylist availability
router.patch('/:id/availability', async (req, res) => {
    try {
        const stylist = await Stylist.findById(req.params.id);
        if (!stylist) {
            return res.status(404).json({ success: false, message: 'Stylist not found' });
        }
        stylist.isAvailable = !stylist.isAvailable;
        await stylist.save();
        res.status(200).json({
            success: true,
            message: `Stylist availability updated to ${stylist.isAvailable ? 'Available' : 'Unavailable'}`,
            data: stylist
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/stylists/:id
// @desc    Delete a stylist record
router.delete('/:id', async (req, res) => {
    try {
        const stylist = await Stylist.findByIdAndDelete(req.params.id);
        if (!stylist) {
            return res.status(404).json({ success: false, message: 'Stylist not found' });
        }
        res.status(200).json({ success: true, message: 'Stylist removed successfully' });
    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.message });
    }
});

module.exports = router;
