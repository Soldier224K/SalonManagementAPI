require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Service = require('./models/Service');
const Stylist = require('./models/Stylist');
const Customer = require('./models/Customer');
const Appointment = require('./models/Appointment');
const Bill = require('./models/Bill');
const Product = require('./models/Product');
const Review = require('./models/Review');

const seedData = async () => {
    try {
        await connectDB();

        console.log('🧹 Clearing existing collections...');
        await Promise.all([
            Service.deleteMany({}),
            Stylist.deleteMany({}),
            Customer.deleteMany({}),
            Appointment.deleteMany({}),
            Bill.deleteMany({}),
            Product.deleteMany({}),
            Review.deleteMany({})
        ]);

        console.log('✨ Seeding Services...');
        const services = await Service.insertMany([
            {
                name: 'Executive Haircut & Styling',
                category: 'Hair Care',
                description: 'Precision haircut with head massage, wash, and styling finish.',
                price: 499,
                durationMinutes: 45,
                targetGender: 'Unisex',
                isActive: true
            },
            {
                name: 'Keratin Hair Smoothing Treatment',
                category: 'Hair Care',
                description: 'Intense protein therapy for frizz-free, shiny, and smooth hair.',
                price: 2999,
                durationMinutes: 120,
                targetGender: 'Female',
                isActive: true
            },
            {
                name: 'Hydra Glow Deep Cleansing Facial',
                category: 'Skin Care',
                description: 'Multi-step skin rejuvenation treatment with deep pore extraction and hydration.',
                price: 1499,
                durationMinutes: 60,
                targetGender: 'Unisex',
                isActive: true
            },
            {
                name: 'Royal Spa Manicure & Pedicure',
                category: 'Nail Care',
                description: 'Aromatherapy scrub, cuticle care, massage, and nail buffing/polish.',
                price: 899,
                durationMinutes: 60,
                targetGender: 'Unisex',
                isActive: true
            },
            {
                name: 'Beard Sculpting & Hot Towel Treatment',
                category: 'Beard & Grooming',
                description: 'Beard trimming, oil massage, and soothing hot towel application.',
                price: 349,
                durationMinutes: 30,
                targetGender: 'Male',
                isActive: true
            },
            {
                name: 'Bridal HD Makeup & Hairdo',
                category: 'Bridal & Makeup',
                description: 'High-definition bridal makeup with lashes, draping, and designer hairstyle.',
                price: 5999,
                durationMinutes: 150,
                targetGender: 'Female',
                isActive: true
            }
        ]);

        console.log('💈 Seeding Stylists...');
        const stylists = await Stylist.insertMany([
            {
                name: 'Elena Rostova',
                email: 'elena.stylist@glamour.com',
                phone: '+91 98765 43210',
                specialties: ['Hair Care', 'Hair Coloring', 'Keratin'],
                experienceYears: 7,
                rating: 4.9,
                isAvailable: true,
                workingHours: { start: '09:00', end: '18:00' },
                daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            },
            {
                name: 'Marcus Vance',
                email: 'marcus.grooming@glamour.com',
                phone: '+91 98765 43211',
                specialties: ['Beard & Grooming', 'Men Haircut', 'Facial'],
                experienceYears: 5,
                rating: 4.8,
                isAvailable: true,
                workingHours: { start: '10:00', end: '19:00' },
                daysAvailable: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            {
                name: 'Priya Sharma',
                email: 'priya.makeup@glamour.com',
                phone: '+91 98765 43212',
                specialties: ['Bridal & Makeup', 'Skin Care', 'Nail Care'],
                experienceYears: 8,
                rating: 5.0,
                isAvailable: true,
                workingHours: { start: '09:30', end: '18:30' },
                daysAvailable: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            }
        ]);

        console.log('👤 Seeding Customers...');
        const customers = await Customer.insertMany([
            {
                name: 'Aarav Mehta',
                email: 'aarav.mehta@gmail.com',
                phone: '+91 99887 76655',
                gender: 'Male',
                preferences: ['Prefers organic beard oil', 'Short crop style'],
                loyaltyPoints: 120,
                address: 'Bandra West, Mumbai'
            },
            {
                name: 'Ananya Deshmukh',
                email: 'ananya.deshmukh@gmail.com',
                phone: '+91 98712 34567',
                gender: 'Female',
                preferences: ['Sensitive skin', 'Prefers sulfate-free shampoo'],
                loyaltyPoints: 250,
                address: 'Koregaon Park, Pune'
            },
            {
                name: 'Rohit Kulkarni',
                email: 'rohit.kulkarni@yahoo.com',
                phone: '+91 91234 56789',
                gender: 'Male',
                preferences: ['Coffee during appointment'],
                loyaltyPoints: 40,
                address: 'FC Road, Pune'
            }
        ]);

        console.log('📦 Seeding Products...');
        const products = await Product.insertMany([
            {
                name: 'Moroccan Argan Hair Serum',
                category: 'Hair Care',
                brand: 'Moroccanoil',
                price: 1250,
                stockQuantity: 18,
                lowStockThreshold: 5,
                isAvailable: true
            },
            {
                name: 'Tea Tree Beard Grooming Oil',
                category: 'Beard Care',
                brand: 'Beardo',
                price: 499,
                stockQuantity: 4, // Low stock example
                lowStockThreshold: 5,
                isAvailable: true
            },
            {
                name: 'Vitamin C Brightening Face Serum',
                category: 'Skin Care',
                brand: 'DermaCo',
                price: 799,
                stockQuantity: 25,
                lowStockThreshold: 8,
                isAvailable: true
            },
            {
                name: 'Matte Finish Strong Hold Hair Clay',
                category: 'Styling',
                brand: 'Schwarzkopf',
                price: 850,
                stockQuantity: 12,
                lowStockThreshold: 4,
                isAvailable: true
            }
        ]);

        console.log('📅 Seeding Appointments...');
        const appointment1 = await Appointment.create({
            customer: customers[0]._id,
            stylist: stylists[1]._id,
            services: [services[0]._id, services[4]._id], // Haircut + Beard
            appointmentDate: new Date(),
            timeSlot: '11:00 AM',
            status: 'Completed',
            totalAmount: 848,
            notes: 'Customer requested side fade cut.'
        });

        const appointment2 = await Appointment.create({
            customer: customers[1]._id,
            stylist: stylists[0]._id,
            services: [services[1]._id, services[2]._id], // Keratin + Facial
            appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
            timeSlot: '02:30 PM',
            status: 'Confirmed',
            totalAmount: 4498,
            notes: 'Upcoming birthday prep.'
        });

        console.log('💳 Seeding Bills...');
        await Bill.create({
            billNumber: 'SLN-20260827-1001',
            customer: customers[0]._id,
            appointment: appointment1._id,
            items: [
                { name: 'Executive Haircut & Styling', price: 499, quantity: 1, type: 'Service' },
                { name: 'Beard Sculpting & Hot Towel Treatment', price: 349, quantity: 1, type: 'Service' }
            ],
            subtotal: 848,
            discount: 50,
            tax: 40,
            totalAmount: 838,
            paymentMethod: 'UPI',
            paymentStatus: 'Paid',
            paidAt: new Date()
        });

        console.log('⭐ Seeding Reviews...');
        await Review.create({
            customer: customers[0]._id,
            stylist: stylists[1]._id,
            service: services[4]._id,
            rating: 5,
            comment: 'Marcus did a phenomenal job sculpting my beard. Very clean studio!'
        });

        console.log('✅ Database seeded successfully with Salon Management sample data!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
