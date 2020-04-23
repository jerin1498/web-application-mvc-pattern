const express = require('express');
const router = express.Router();
const userControllers = require('./../controllers/userController');
const authController = require('./../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

// after this block of code every route will protect to only login users
router.use(authController.protect); // after this middlewere every one must login 
// router.patch('/updatepassword', authController.protect, authController.updatePassword); example

// form user side
router.patch('/updatepassword', authController.updatePassword);
router.get('/me', userControllers.getMe, userControllers.getUser);
router.patch('/updateme', userControllers.uploadUserPhoto,
        userControllers.resizeUserPhoto,
        userControllers.updateMe);
router.delete('/deleteme', userControllers.deleteMe);

// after this block of code ervery routes are allowed only to the admin
router.use(authController.restrictTo('admin')); // only for admin
// from admin side
router.route('/') 
    .get(userControllers.getAllUsers)
    .post(userControllers.createUser);

router.route('/:id')
    .get(userControllers.getUser)
    .patch(userControllers.updateUser)
    .delete(userControllers.deleteUser);

module.exports = router;








