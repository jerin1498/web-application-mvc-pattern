const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const factory = require('./handlerFactory');
const multer = require('multer'); // middleware used for uploading image
const sharp = require('sharp');// image processing package for nodejs
const fs = require('fs');


const multerStorage = multer.memoryStorage();// stores the file in req.file.buffer  in the format of buffer

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

exports.uploadTourImages = upload.fields([  // uploading miltiple fields and multiple files req.files
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next()
    // updating cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);
    
    // for uploading tour images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);
            req.body.images.push(filename)
        })
    );
        // console.log(__dirname)
    
    next()
});


// upload.single('image')  for uploading single field and single image  req.file
// upload.array('images', 5)  for uploading single field and multiple images req.files

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
    // req.query.price = {lte:500};
    next();
};

// // error handeling higher order function alter way for try and expect
// const catchAsync = fn => { 
//     return (req, res, next) => {
//         fn(req, res, next).catch(err=> next(err)) 
//     }
// };

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        { $match: { ratingsAverage: { $gte: 4.6 } } },
        {
            $group: {
                _id: "$difficulty",
                numTours: { $sum: 1 },
                numRatings: { $sum: "$ratingsQuantity" },
                avgRatings: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
    ]);
    res.status(200).json({
        message: "success",
        stats
    })
} 
    
);

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: "$_id" }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTourStarts: -1 }
        }
    ]);

    res.status(200).json({
        message: 'success',
        plan
    });
}
);

exports.getTour = factory.getOne(Tour,
    { path: 'guides', select: '-__v -passwordChangedAt' }, 'reviews');

// exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate(
//         {
//             path: 'guides',
//             select: '-__v -passwordChangedAt'
//         }
//     ).populate('reviews'); // Tour.findOne({_id: req.params.id})

//     if (!tour) {
//         return next(new AppError('no tour found with that id', 404));
//     };
//     res.status(200).json({
//         status: "success",
//         tour
//     });   
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//     // const newTour = new Tour(req.body)
//     // newTour.save()

//     //console.log(typeof req.body)  // javascript object not json
//     const newTour = await Tour.create(req.body);
//     res.status(200).json({
//         status: "success",
//         tour: newTour
//     });
// });

exports.updateTour = factory.updateOne(Tour)
// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     return res.status(200).json({
//         status: "success",
//         tour
//     });
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//         return next(new AppError('cant delete the tour with that id', 404));
//     };
//     return res.status(204).json({
//         status: 'success'
//     });
// });

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//     const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limit()
//         .paginate();
    
//     const tours = await features.query;
    
//     return res.status(200).json({
//         created: req.requestTime,
//         data: {
//             message: "success",
//             tours
//         }

//     });
// });


// /tours-within/:distance/center/:latlng/unit/:unit  this is how the rout looks like
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // 6378.1 is radious of eirth in km 3963.2 is in miles

    if (!lat || !lng) {
        next(
            new AppError('Please provide a latitude and longitude in the format of lat,lng', 400)
        )
    };

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });


    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {data: tours}
    });
});

// /distances/:latlng/unit/:unit
exports.getDistances = catchAsync( async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(
            new AppError('Please provide a latitude and longitude in the format of lat,lng', 400)
        )
    };

    const multiplayer = unit === 'mi'? 0.000621371 : 0.001 // converting meter into miles and kilometers
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance', // virtual field
                distanceMultiplier: multiplayer // to convert meter into km
            },
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        data: {data: distances}
    });
});

// exports.getAllTours = async (req, res, next) => {
//     try {
        // // 1) filtering
        // const queryObj = { ...req.query };
        // const excludeFields = ['page', 'sort', 'limit', 'fields'];
        // excludeFields.forEach(el => delete queryObj[el]);
        // // 2) advance filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`);
        // let query = Tour.find(JSON.parse(queryStr));

        // // sorting

        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     query = query.sort(sortBy);
        // } else {
        //     query = query.sort('-createdAt');
        // };

        // // field limiting
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ')
        //     query = query.select(fields);
        // } else {
        //     query = query.select('-__v')
        // };

        // // paginstion
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;
        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip >= numTours) {
        //         throw new Error('this page does not exist');
        //     };
        // };

        // query = query.skip(skip).limit(limit);

        // const tours = await query;

//         const features = new APIFeatures(Tour.find(), req.query)
//             .filter()
//             .sort()
//             .limit()
//             .paginate();
        
//         const tours = await features.query;
        
//         return res.status(200).json({
//             created: req.requestTime,
//             data: {
//                 message: "success",
//                 tours
//             }

//         }); 
//     }
//     catch(err){
//         return res.status(404).json({
//             status: "err",
//             message: err
//         });
//     } 
// };
