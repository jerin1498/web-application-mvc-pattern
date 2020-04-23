const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require("./userModel");
// const DB_PASSWORD = process.env.DATA_BASE_PASSWORD;
// const DB = process.env.DATABASE.replace('<PASSWORD>', DB_PASSWORD);
const DB = "mongodb://localhost:27017/natours" // temporary using local instance because internet problem
// const DB = "mongodb+srv://jerin:jerinhappy1498@cluster0-4r65j.mongodb.net/natours?retryWrites=true&w=majority"


mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    // console.log(con.connections);
    console.log('connection successful for tour');
});

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'tour must not exied 40 characterd'],
        minlength: [10, 'tour must have minimum 10 characters']
        // validate: [validator.isAlpha, 'tour name must contain only letters']
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a durations"]
    },
    maxGroupSize: {
        type: Number,
        required:[true, "A tour must have a maxgroup size"]
    },  
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficuilty "],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'difficulty must be easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "minimum rating must be 1"],
        max: [5, "maximum rating must be 5"],
        set: val => Math.round(val*10)/10 //eg 4.6666, 46.666, 47, 4.7  run every time new value is updated to this field
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'a tour must have a price']
    },
    priceDiscount: {
        type: Number, 
        validate: { // does not work whie update only work on create time
            validator: function (val) { 
                return val < this.price
            },
            message: 'discount price ({VALUE}) must be lesser than actual price '
        }
    }, 
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a description(summary)"]
    },
    description: {
        type: String,
        trim: true
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have image']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startLocation: { // object 
        // GeoJson
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number], // longitude , latitude (reverse order longitude first)
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [ // child reference type
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User' // no need to import User
        }
    ],
    // guides: Array, // emberding method 
    images: [String],
    slug: String,
    startDates: [Date]
},
{
    toJSON: { virtuals: true }, // for outputing virtual
    toObject: {virtuals: true}
});

// creating our own index to incerase the speed and performance
tourSchema.index({ price: 1, ratingsAverage: -1 }); // -1 decending oreder
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // only for geospechal data

// virtual obj
tourSchema.virtual('durationsWeek').get(function () {
    return this.duration / 7;
});
// virtual populate review in tour without saving in the database
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',//(id of tour)
    localField: '_id' // matching id in the 'foreignField: 'tour'(tour id is saved in tour)' are filtered out and that reviews are populated
});
// Document middleware (like django pre save signals) triger on before .save(), .create(), not work in insertMany()
tourSchema.pre('save', function (next) { 
    this.slug = slugify(this.name, { lower: true });
    next();
});
//pre query middlewhere activate only on query
tourSchema.pre('find', function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});
// aggregation middlewhere
// tourSchema.pre('aggregate', function (next) {    
//     // console.log(this.pipeline());
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     next();
// });
// pre populate middleware
tourSchema.pre('find', function (next) {
    this.populate(
        {
            path: 'guides',
            select: '-__v -passwordChangedAt'
        }
    );
    next()
});
// emberding to get user 
// tourSchema.pre('save',async function (next) { 
//     const guidePromise = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidePromise);
//     next();
// });
// post save document middleware triger on before .save(), .create(),  
tourSchema.post('save', function (doc, next) {
    console.log(doc.name, ' saved sucessfully');
    next()
});
// post query middleware
tourSchema.post('find', function (docs, next) {
    console.log(`query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs)
    next();
})


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;