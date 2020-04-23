const fs = require('fs');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// importing tour data in database

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);
        
        console.log("data loaded sucessfully")     
        
    } catch (err) {
        console.log(err)
    };
    process.exit();
};

// delete existing data from db

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
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