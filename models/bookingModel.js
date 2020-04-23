const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'production') {
    const DB_PASSWORD = process.env.DATA_BASE_PASSWORD;
    DB = process.env.DATABASE.replace('<PASSWORD>', DB_PASSWORD);
// const DB = "mongodb+srv://jerin:jerinhappy1498@cluster0-4r65j.mongodb.net/natours?retryWrites=true&w=majority"
} else {
     DB = "mongodb://localhost:27017/natours" // temporary using local instance because internet problem
    
}
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(con => {
    // console.log(con.connections);
    console.log('connection successful for Booking');
});

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

