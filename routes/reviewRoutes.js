const express = require('express');
const router = express.Router();
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');


router.use(authController.protect) // every user should login

router.route('/')
    .get(reviewController.getAllReview)
    .post(authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview)


router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)

    
module.exports = router;