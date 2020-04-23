const express = require('express');
const router = express.Router();
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

// checking all routs that loggedin or not
// router.use(authController.isLoggedIn);

// end points
router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/signin', authController.isLoggedIn, viewsController.getSigninForm);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);




//using html form submit method
// router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;

