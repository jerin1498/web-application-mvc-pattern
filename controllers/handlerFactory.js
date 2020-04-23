const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');


exports.deleteOne = Model => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(new AppError('cant delete the document with that id', 404));
        };
        return res.status(204).json({
            status: 'success'
        });
    });
};

exports.updateOne = Model => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) {
            return next(new AppError('No document found with that id', 404))
        };

        return res.status(200).json({
            status: "success",
            data: { data: doc }
        });
    });
};

exports.createOne = Model => {
    return catchAsync(async (req, res, next) => {

        const doc = await Model.create(req.body);
    
        res.status(200).json({
            status: "success",
            data: { data: doc }
        });
    });
};

exports.getOne = (Model, populateOptionsOne, populateOptionsTwo) => {
    return catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (populateOptionsTwo && populateOptionsOne) {
            query = query.populate(populateOptionsOne).populate(populateOptionsTwo);
        } else if (populateOptionsOne) {
            query = query.populate(populateOptionsOne)
        };

        const doc = await query;

        if (!doc) {
            return next(new AppError('no document found with that id', 404));
        };
        res.status(200).json({
            status: "success",
            data: { data: doc }
        });
    })
};

exports.getAll = Model => {
    return catchAsync(async (req, res, next) => {
        let filter = {}; // to allow nested get reviews on tour (hack)
        if(req.params.tourId) filter = {tour: req.params.tourId}

        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limit()
            .paginate();
    
        const doc = await features.query
        // const doc = await features.query.explain();
    
        return res.status(200).json({
            status: "success",
            data: {
                message: "success",
                data: { data: doc }
            }

        });
    })
};