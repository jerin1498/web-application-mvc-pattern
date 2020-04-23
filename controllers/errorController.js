const AppError = require('./../utils/appError');

const sendErrorProd = (err, req, res) => {
    // for api's error page
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperaional) {// operational err send to clint
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        };

        // 1) log error to the terminal
        console.error('ERROR ', err)
        // 2) sending generic message to the client
        return res.status(500).json({// programming error dont leack the err details
            status: "error",
            message: 'something went wrong! Try after sometime'
        });
        
    };
    // for pug template error  browser side
    if (err.isOperaional) {// operational err send to clint
        console.log(err)
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    };
        
        console.error('ERROR ', err)
        // 2) sending generic message to the client
    return res.status(500).render('error',
        {
            title: "error",
            msg: 'something went wrong'
    });
};

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) { // for api's
        console.log(err)
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else { // for pug rendered templates 'website'
        // console.log(err)
        res.status(err.statusCode).render('error', {
            title: 'something went wrong',
            msg: err.message
        })
    }
};

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400)
};

const handleDuplicateFieldsDB = err => {
    const errorValue = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    // console.log(errorValue)
    const message = `Duplicate field value ${errorValue} please use another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    // console.log(errors)
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('invalid token please provid a valid token', 401);


const handleJWTExpiredError = () => new AppError('your token has expired please log in again to get new token', 401);


module.exports = (err, req, res, next) => {
    // console.log(err.stack)
    // process.env.NODE_ENV = 'development';     // turning on into production env default is dev env
    // console.log(process.env.NODE_Env)
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;  
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
        // console.log(error)
        sendErrorProd(error, req, res)
    };
};