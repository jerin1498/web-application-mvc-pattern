const dotenv = require('dotenv');

// uncaughtExpection for sync code err
process.on('uncaughtException', err => {
    console.log(err.name, err.message)
    console.log('UNCAUGHT EXPECTION Shutting down');
    console.log(err);
        process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log(process.env);
// start server
const port = process.env.PORT || 3001;    // env variable check in config.env file
const server = app.listen(port, () => {
    console.log(`app is running at port ${port}`);
});

// unhandledRejection for async code forgot to set catch method
process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log('UNHANDLED REJECTION Shutting down');
    console.log(err);
    server.close(() => {
        process.exit(1);
    });   
});


// console.log(x)