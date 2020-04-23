const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Bookings must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user']
    },
    price: {
        type: Number,
        required: [true, 'Bookings must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre('find', function (next) {
    this.populate('user')
        .populate({
        path: 'tour',
        select: 'name'
    });
    next()
});

bookingSchema.pre('findOne', function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
    next()
});


const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

