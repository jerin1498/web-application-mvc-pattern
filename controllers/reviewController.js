const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');


exports.setTourUserIds = (req, res, next) => { 
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.getReview = factory.getOne(Review);

exports.getAllReview = factory.getAll(Review);
// exports.getAllReview = catchAsync(async (req, res, next) => {
//     let filter = {};
//     if(req.params.tourId) filter = {tour: req.params.tourId}
//     const reviews = await Review.find(filter);
    
//     return res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: {
//             reviews
//         }
//     });
// });

exports.createReview = factory.createOne(Review);
// exports.createReview = catchAsync(async (req, res, next) => {
//     // allow nested routes
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     if (!req.body.user) req.body.user = req.user.id;
//     newReview = await Review.create(req.body);
//     return res.status(201).json({
//         status: "success",
//         data: { newReview }
//     });
// });

