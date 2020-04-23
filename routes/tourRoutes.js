// const fs = require('fs');
const express = require('express');
const tourControllers = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');


const router = express.Router();
// parm middleware
// router.param('id', tourControllers.checkID);

// for cheap and best tours
router.route('/top-5-cheap').get(tourControllers.aliasTopTours, tourControllers.getAllTours);

// for stats
router.route('/tour-stats').get(tourControllers.getTourStats);
//for monthly plan
router.route('/monthly-plan/:year')
    .get(authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthlyPlan)

// routs for tours
router.route('/')
    .get(tourControllers.getAllTours)
    .post(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourControllers.createTour)

router.route('/:id')
    .get(tourControllers.getTour)
    .patch(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourControllers.uploadTourImages,
        tourControllers.resizeTourImages,
        tourControllers.updateTour)
    .delete(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourControllers.deleteTour);

// routers for review eg => GET tour/id-of-tour/review
router.route('/:tourId/reviews')
    .get(reviewController.getAllReview)
    .post(authController.protect,
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourControllers.getToursWithin);

router.route('/distances/:latlng/unit/:unit')
    .get(tourControllers.getDistances)

module.exports = router;

