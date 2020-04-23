const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
// routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRouter');
const bookingRouter = require('./routes/bookingRouter');

// cookie parser from the incomming request
const cookieParser = require('cookie-parser');
// const fs = require('fs');
const app = express();
// template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');

// GLOBAL MIDDLEWIRES
// SET SECURITY HTTP HEADERS
app.use(helmet());
// DEVELOPMENT LOGIN
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};
// LIMIT REQUESTS FROM SAME API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, // in millseconds
    message: 'Too many reqests for this ip try after one hour'
});
app.use('/api', limiter); // only for /api
// BODY PARSER reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
// html or pug form data parser while post data using form
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// cookie parser
app.use(cookieParser());
// data sanitization against no sql ingection attack
app.use(mongoSanitize());
// data sanitization against xss
app.use(xss());
// prevent http polution 
app.use(hpp({
    whitelist: [
        'duration',
        'ratingQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'price'
    ]
}));

// costome test middlewere
app.use((req, res, next) => {
    // console.log(req.cookies)
    req.requestTime = new Date().toISOString();
    next();
});

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// const getAllTours = (req, res) => {
//     return res.status(200).json({
//         status: 'success',
//         tequestTime: req.requestTime,
//         created: req.requestTime,
//         results: tours.length,
//         data: {
//             // tours: tours  old model before es-6, down one new way
//             tours,
//         }
        
//     });
// };

// const getTour = (req, res) => { 
//     const id = req.params.id * 1;
//     const tour = tours.find(e => e.id === id);
    
//     if (tour === undefined) {
//             return res.status(404).json({
//             status: 'cannot find the object 404 err',
//         })
//     };
//     return res.status(200).json({
//             status: 'success',
//             data: { tour }
//         });
// };

// const postTour = (req, res) => {
//     const newId = tours[tours.length - 1].id + 1;
//     const newTour = Object.assign({ id: newId }, req.body);
//     tours.push(newTour);
//     fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//         res.status(201).json(
//             {
//                 status: 'sucess',
//                 data: { tour: newTour }
//             }
//         )
//     });
// };

// const patchTour = (req, res) => {

//     return res.status(201).json({ status: 'success' })
// };
// const deleteTour = (req, res) => {

//     return res.status(201).json({ status: 'success' })
// };
// // functions for  userRouter
// const createUser = (req, res) => { 
//     res.status(500).json({
//         status: 'internal server error',
//         message: 'function not completed'
//     });
// };

// const getAllUsers = (req, res) => { 
//     res.status(500).json({
//         status: 'internal server error',
//         message: 'function not completed'
//     });
// };

// const getUser = (req, res) => { 
//     res.status(500).json({
//         status: 'internal server error',
//         message: 'function not completed'
//     });
// };

// const updateUser = (req, res) => { 
//     res.status(500).json({
//         status: 'internal server error',
//         message: 'function not completed'
//     });
// };

// const deleteUser = (req, res) => { 
//     res.status(500).json({
//         status: 'internal server error',
//         message: 'function not completed'
//     });
// };

// getting data
// app.get('/api/v1/tours/:id?', allTours);
// posting data
// app.post('/api/v1/tours', postTour);
//updating data
// app.patch('/api/v1/tours/:id', patchTour);
// const tourRouter = express.Router();
// const userRouter = express.Router();

// routs for tours
// tourRouter.route('/')
//     .get(getAllTours)
//     .post(postTour);

// tourRouter.route('/:id')
//     .get(getTour)
//     .patch(patchTour)
//     .delete(deleteTour);


// // routs for  userRouter.route('/')
// userRouter.route('/')
//     .get(getAllUsers)
//     .post(createUser);

// userRouter.route('/:id')
//     .get(getUser)
//     .patch(updateUser)
//     .delete(deleteUser);




app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter)

// router error handeling
app.all('*', (req, res, next) => { // .all = .get, .post ...... all
    // err = new Error(`can't find ${req.originalUrl} on this server`); // normal way
    // err.statusCode = 404;
    // err.status = 'fail';

    err = new AppError(`can't find ${req.originalUrl} on this server`, 404);// our coustom method /utils
    next(err);
});

app.use(globalErrorHandler);


// // start server
// const port = 3000;
// app.listen(port, () => {
//     console.log(`app is running at port ${port}`);
// });

module.exports = app;