const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Stylist = require('../models/Stylist');
const Customer = require('../models/Customer');

// @route   GET /api/appointments
// @desc    Get all appointments (supports filters: status, stylist, customer, date)
router.get('/', async (req, res) => {
    try {
        const { status, stylist, customer, date } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        if (stylist) {
            query.stylist = stylist;
        }

        if (customer) {
            query.customer = customer;
        }

        if (date) {
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);
                query.appointmentDate = { $gte: startDate, $lte: endDate };
            }
        }

        const appointments = await Appointment.find(query)
            .populate('customer', 'name email phone loyaltyPoints')
            .populate('stylist', 'name phone email specialties rating')
            .populate('services', 'name category price durationMinutes')
            .sort({ appointmentDate: -1, timeSlot: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment by ID
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('customer', 'name email phone loyaltyPoints')
            .populate('stylist', 'name phone email specialties rating')
            .populate('services', 'name category price durationMinutes');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   POST /api/appointments
// @desc    Book a new appointment
router.post('/', async (req, res) => {
    try {
        const { customer, stylist, services, appointmentDate, timeSlot, notes } = req.body;

        // Verify customer exists
        const existingCustomer = await Customer.findById(customer);
        if (!existingCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Verify stylist exists
        const existingStylist = await Stylist.findById(stylist);
        if (!existingStylist) {
            return res.status(404).json({ success: false, message: 'Stylist not found' });
        }

        // Calculate total amount from selected services
        const serviceDocs = await Service.find({ _id: { $in: services } });
        if (!serviceDocs || serviceDocs.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one valid service is required' });
        }

        const totalAmount = serviceDocs.reduce((sum, s) => sum + s.price, 0);

        const appointment = new Appointment({
            customer,
            stylist,
            services,
            appointmentDate,
            timeSlot,
            notes,
            totalAmount,
            status: req.body.status || 'Confirmed'
        });

        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('customer', 'name email phone')
            .populate('stylist', 'name phone specialties')
            .populate('services', 'name price durationMinutes');

        // Emit real-time Socket.io event if initialized
        const io = req.app.get('io');
        if (io) {
            io.emit('newAppointment', populatedAppointment);
        }

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: populatedAppointment
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment details
router.put('/:id', async (req, res) => {
    try {
        const { services } = req.body;

        if (services && Array.isArray(services)) {
            const serviceDocs = await Service.find({ _id: { $in: services } });
            req.body.totalAmount = serviceDocs.reduce((sum, s) => sum + s.price, 0);
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('customer', 'name email phone')
            .populate('stylist', 'name phone specialties')
            .populate('services', 'name price durationMinutes');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('appointmentUpdated', appointment);
        }

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/appointments/:id/status
// @desc    Update appointment status (Pending, Confirmed, In-Progress, Completed, Cancelled)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        )
            .populate('customer', 'name email phone')
            .populate('stylist', 'name phone specialties')
            .populate('services', 'name price durationMinutes');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('appointmentStatusUpdated', appointment);
        }

        res.status(200).json({
            success: true,
            message: `Appointment status updated to ${status}`,
            data: appointment
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel and delete appointment
router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('appointmentCancelled', { id: req.params.id });
        }

        res.status(200).json({ success: true, message: 'Appointment cancelled and deleted successfully' });
    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.message });
    }
});

module.exports = router;
