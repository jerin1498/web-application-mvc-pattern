const fs = require('fs');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

// dotenv.config({ path: './config.env' });
// const password = process.env.DATA_BASE_PASSWORD;
// const DB = process.env.DATABASE.replace('<PASSWORD>', password);
// const DB = "mongodb+srv://jerin:jerinhappy1498@cluster0-4r65j.mongodb.net/natours?retryWrites=true&w=majority"

// mongoose.connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// })
//     .then(console.log("db connestion success"));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// importing tour data in database

const importData = async () => {
    try {
        const newAddedTours = await Tour.create(tours);
        // console.log(newAddedTours)
        console.log("data loaded sucessfully")     
        
    } catch (err) {
        console.log(err)
    };
    process.exit();
};

// delete existing data from db

const deleteData = async () => {
    try {
        const deleted = await Tour.deleteMany();
        // console.log(deleted)
        console.log("successfuly deleted");    
        
    } catch (err) {
        console.log("err in deleting  \n", err)
    };
    process.exit();
};

console.log(process.argv)
if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
};

// console.log(process.argv)