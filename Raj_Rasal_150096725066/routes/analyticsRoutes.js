const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Customer = require('../models/Customer');
const Stylist = require('../models/Stylist');
const Service = require('../models/Service');
const Product = require('../models/Product');

// @route   GET /api/analytics/dashboard
// @desc    Get salon key performance indicators & overview stats
router.get('/dashboard', async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const totalStylists = await Stylist.countDocuments();
        const totalServices = await Service.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
        const confirmedAppointments = await Appointment.countDocuments({ status: 'Confirmed' });
        const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });

        // Total revenue
        const paidBills = await Bill.find({ paymentStatus: 'Paid' });
        const totalRevenue = paidBills.reduce((sum, b) => sum + b.totalAmount, 0);

        // Low stock products alert
        const lowStockProducts = await Product.find({
            $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
        });

        // Top rated stylists
        const topStylists = await Stylist.find().sort({ rating: -1 }).limit(3);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalRevenue,
                    totalCustomers,
                    totalStylists,
                    totalServices,
                    totalAppointments
                },
                appointments: {
                    pending: pendingAppointments,
                    confirmed: confirmedAppointments,
                    completed: completedAppointments
                },
                inventoryAlerts: {
                    lowStockCount: lowStockProducts.length,
                    items: lowStockProducts
                },
                topStylists
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
