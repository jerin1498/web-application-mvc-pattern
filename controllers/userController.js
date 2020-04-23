const multer = require('multer'); // middleware used for uploading image
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const sharp = require('sharp');// image processing package for nodejs


// const multerStorage = multer.diskStorage({ // normal way but it only work for square images so below method is best
//     destination: (req, file, cb) => {// path for uploading images
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();// stores the file in req.file.buffer  in the format of buffer

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer) // image processing package for nodejs
        .resize(500, 500) // pixels
        .toFormat('jpeg')
        .jpeg({ quality: 90 }) // 90%
        .toFile(`public/img/users/${req.file.filename}`)
    next()
})

const multerFilter = (req, file, cb) => { // filtering only images 
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Please upload only images', 400), false)
    }
}

const upload = multer({ // for getting file from request
    storage: multerStorage,
    fileFilter: multerFilter
 });
exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

// functions for  userRouter

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1 create error if user posts password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This rout is not for password update. Please use updatepassword rout'))
    }
    // 2 filer out unwanted fields that are not allowed
    const filterBody = filterObj(req.body, 'name', 'email');
    if (req.file) filterBody.photo = req.file.filename;
    // console.log(filterBody)
    // 3 update user document
    const id = req.user._id;
    const updateUser = await User.findByIdAndUpdate(id, filterBody, { new: true, runValidators: true });
    res.status(200).json({
        status: "success",
        data: {
            user: updateUser
        }
    });
});


exports.deleteMe = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    await User.findByIdAndUpdate(id, {active: false})
    res.status(203).json({
    status: 'success',
    data: {}
    });
});

exports.createUser = (req, res) => { 
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined please use /singup insted '
    });
};


exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User); // do not update password with because most of the validators will not work

exports.deleteUser = factory.deleteOne(User);

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res) => { 
//     users = await User.find();
//     res.status(400).json({
//         status: 'success',
//         users
//     });
// });