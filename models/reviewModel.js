const mongoose = require('mongoose');
const Tour = require('./tourModel');

const DB = "mongodb://localhost:27017/natours" // temporary using local instance because internet problem
// const DB = "mongodb+srv://jerin:jerinhappy1498@cluster0-4r65j.mongodb.net/natours?retryWrites=true&w=majority"

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    // console.log(con.connections);
    console.log('connection successful for review');
});

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        trim: true,
        required: [true, 'Review cannot be empty']
    },
    rating: {
        type: Number,
        min: [1, 'minimum rating is 1'],
        max: [5, "maximum rating is 5"]
    },
    date: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, 'Review must belong a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'user must belong to a tour']
    }
},
{
    toJSON: { virtuals: true }, // for outputing virtual
    toObject: {virtuals: true}
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });// avoid duplicate review by the same user

reviewSchema.pre('find', function (next) {
    this.populate({ // populate method will reduce the speed
        path: 'user',
        select: 'name photo'
    })//.populate({
    //     path: 'tour',
    //     select: 'name'
    // });
    next();
});

reviewSchema.statics.calAverageRatings = async function (tourId) {// works directly on model not on instance
    const stats = await this.aggregate([// eg Review.calAverageRatings()
        {// this.aggregate == Review.aggregate
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    // console.log(stats);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
        ratingQuantity: 0,
        ratingsAverage: 4.5
    }); 
    };

};

reviewSchema.post('save', function () {
    this.constructor.calAverageRatings(this.tour); // this.constructor == Review
});

reviewSchema.pre('findOneAndUpdate', async function (next) {//findByIdAndUpdate
    // console.log(await this.findOne())
    this.r = await this.findOne() // before update value
    next();
});
reviewSchema.pre('findOneAndDelete', async function (next) {//findByIdAndDelete
    this.r = await this.findOne()
    next();
});

reviewSchema.post('findOneAndUpdate', async function () { //findByIdAndUpdate
    // console.log(await this)
    // console.log(this.r) // after updated value
    await this.r.constructor.calAverageRatings(this.r.tour)
});

// reviewSchema.post('findOneAndUpdate',async  function () { // best way but i dont know y he use above method
//     const review = await this.findOne();
//     await review.constructor.calAverageRatings(review.tour)
// });


reviewSchema.post('findOneAndDelete', async function () { //findByIdAndDelete
    await this.r.constructor.calAverageRatings(this.r.tour)
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


