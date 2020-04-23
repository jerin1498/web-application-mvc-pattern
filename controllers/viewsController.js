const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const Booking = require('./../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    }).populate({
        path: 'guides',
        fields: 'role name photo'
    });
    if (!tour) {
        return next(new AppError('Their is no tour with that name', 404))
    }
    let booked = false;
    if (res.locals.user) {
        const userId = res.locals.user._id;
        toursBookedByUser = await Booking.find({ user: userId });
        if (toursBookedByUser.length) {
            isBooked = toursBookedByUser.filter(el => el.tour.id === tour.id)
            if (isBooked.length) {
                booked = true;  // this tour is booked by the user so change the front end view
            }
        }
    }
        
        
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
        booked
    });
});

exports.getLoginForm = (req, res, next) => {
    res.status(200).render('login', {
        title: 'login page'
    });
};

exports.getSigninForm = (req, res, next) => {
    res.status(200).render('signin', {
        title: 'signin page'
    });
};


exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
};


exports.getMyTours = catchAsync(async (req, res, next) => {
    //1 finging all bookings
    const bookings = await Booking.find({ user: req.user.id });
    //2 finging tours with the returnd ids
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});


// using treditional html form submit method
// exports.updateUserData = catchAsync(async (req, res) => {
//     userId = req.user.id
//     const { name, email } = req.body;
//     const updatedUser = await User.findByIdAndUpdate(userId, {
//         name,
//         email
//     }, { new: true, runValidators: true })
    
//     res.status(200).render('account', {
//         title: 'Your account',
//         user: updatedUser
//     })
// });