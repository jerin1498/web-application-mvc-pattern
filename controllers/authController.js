const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
// const createsendToken = require('./../utils/sendtoken');


const signToken = id => {
    token = jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    return token;
};
const cookieOptions = {
    expires: new Date(Date.now + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // in milliseconds
    httpOnly: true // do not allow browser to modify the cookie
};


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
if (process.env.NODE_ENV === "production") cookieOptions.secure = true; // only send https protocol   
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined; // removing password form output
    return res.status(statusCode).json({
        status: "success",
        token,
        data: { user }
    });
}

// sign in and providing token
exports.signup = catchAsync(async (req, res, next) => { 
    let role = 'user'
    if (req.body.role) {
        if (req.user.role == 'admin' || req.user.role == 'lead-guide') role = req.body.role
    }
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        // passwordChangedAt: req.body.passwordChangedAt,
        role
    });
    url = `${req.protocol}://${req.get('host')}/me`
    await new Email(newUser, url).sendWelcome()
    // createsendToken(newUser, 201, req);
    createSendToken(newUser, 201, res);
});

// giving token to already signed token
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // checking email and password exist in the body
    if (!email || !password) {
        return next(new AppError('should provid email and password', 401));
    };
    // checkeng user and password match
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('invalid email or password', 401));
    };
    // providing token
    // createsendToken(user, 200, req);
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now + 10 * 1000),
        httpOnly: true
    })
    return res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    //1) getting token and check is there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    };
    if (!token || token === 'logout') {
        return next(new AppError('you are not logged in please log in', 401))
    }
    //2) verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded)
    //3) checking if user still exists
    const currentUser = await User.findOne({_id: decoded.id });
    if (!currentUser) { 
        return next(new AppError(' user has deleted create new user to log in '));
    };
    //4) check if user changed password after the token issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next( new AppError('User resently changed password! please login again to get token', 401))
    };
    // authenticated success
    req.user = currentUser;
    res.locals.user = currentUser; // getting data in template 'pug'
    next()
});

exports.isLoggedIn = async (req, res, next) => {
    try {
        //1) getting token by cookie and check is there
        if (req.cookies.jwt) {
            token = req.cookies.jwt;

            //2) verification token
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            //3) checking if user still exists
            const currentUser = await User.findOne({ _id: decoded.id });
            if (!currentUser) {
                res.locals.user = undefined;
                return next();
            };
            //4) check if user changed password after the token issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                res.locals.user = undefined;
                return next()
            };
            // their is a logged in user
            res.locals.user = currentUser; // sending user data to the res so pug template can use just like sending contaxt data in the controller function
            return next()
        };
    } catch{
        // no user loged in block will work during log out or changing the json web token
        res.locals.user = undefined;
        return next()
    }
    // no user logged in
    res.locals.user = undefined;
    next()
};


exports.restrictTo = (...roles) => {
    // console.log(roles)                // side note this run before calling the url always run
    return (req, res, next) => { 
        // console.log(roles)         // roles = ['admin', 'lead-guide']
        // console.log(req.user)
        if (!roles.includes(req.user.role)) {
        console.log(roles)         
        console.log(req.user)
            return next(
                new AppError('you do not have permission to perform this action', 403)
            );
        }
        next()
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1 get user based on their email address
    const user = await User.findOne({ email: req.body.email });
    // console.log(user)
    if (!user) {
        return next(new AppError('There is no user with that email id', 404));
    };
    // 2 generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3 sent the token to the user mail
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`// resetpassword url

        await new Email(user, resetURL).sendPasswordReset()
        res.status(200).json({
            status: "success",
            message: 'token sent to email'
        }); 
    } catch (err) {
        console.log(err)
        user.passwordResetToken = undefined;
        user.PasswordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error while sending the email! please try again later', 500))
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1 get user based on the token
    const rawToken = req.params.token;// database its stored in hashed form
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');// same hash in db
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        PasswordResetExpires: { $gt: Date.now() }
    });
    // 2 if the token is not expired and their is a user set the new password
    if (!user) {
        return next(new AppError('Token is invalid or expired', 401));
    };
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();
    // 3 update changedPasswordAt property for the user 
        // set automatically in user model pre-save middleware
    // 4 log the user in send jwt 
    // createsendToken(user, 200, req);
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1 get user from collections
    const id = req.user.id;
    const user = await User.findById(id).select('+password');
    // 2 check if posted current password is correct
    const password = req.body.password;
    const newpassword = req.body.newpassword;
    const passwordConfirm = req.body.passwordConfirm;
    if (!password || !newpassword || !passwordConfirm) {
        return next(new AppError('please provide password, newpassword and passwordConfirm', 401))
    };
    if (!await user.correctPassword(password, user.password)) {
        return next(new AppError('invalid old password provide a correct old password', 401));
    }; 
    // 3 if so update password
    user.password = newpassword;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    // 4 log user in jwt
    // createsendToken(user, 200, req);
    createSendToken(user, 200, res);
});