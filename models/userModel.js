const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

if (process.env.NODE_ENV === 'production') {
    const DB_PASSWORD = process.env.DATA_BASE_PASSWORD;
    DB = process.env.DATABASE.replace('<PASSWORD>', DB_PASSWORD);
// const DB = "mongodb+srv://jerin:jerinhappy1498@cluster0-4r65j.mongodb.net/natours?retryWrites=true&w=majority"
} else {
     DB = "mongodb://localhost:27017/natours" // temporary using local instance because internet problem
    
}
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(con => {
    // console.log(con.connections);
    console.log('connection successful for user');
});

// name , email, photo, password, passowrdConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have name'],
        trim: true,
        maxlength: [30, 'max charater is 30'],
        minlingth: [5, 'name must have minimum  5 character']
    },
    email: {
        type: String,
        trim: true,
        unique: [true, 'This email already exists please use another email'],
        lowercase: true, 
        required: [true, 'user must have an email id'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    photo: String,
    // these validation only work on save
    password: {
        type: String,
        required: [true, 'password field is must'],
        minlength: [8, 'password must have minimum length of 8 character'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'confirm password field is must'],
        validate: {
            validator: function (pass) {
                return pass === this.password
            },
            message: 'password and passwordConfirm must be same'
        }
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'leade-guide', 'admin'],
        default: 'user'
    },
    photo: {
        type: String,
        default: 'default.jpg',
        required: true
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    PasswordResetExpires: Date
});

userSchema.pre('find', function (next) { 
    // this point to the cuttent querry
    this.find({ active: {$ne: false}});
    next();
});

userSchema.pre('findOne', function (next) { 
    // this point to the cuttent querry
    this.find({ active: {$ne: false}});
    next();
});

userSchema.pre('findOneAndDelete', function (next) { 
    // this point to the cuttent querry
    this.find({ active: {$ne: false}});
    next();
});

userSchema.pre('findOneAndRemove', function (next) { 
    // this point to the cuttent querry
    this.find({ active: {$ne: false}});
    next();
});

userSchema.pre('findOneAndUpdate', function (next) { 
    // this point to the cuttent querry
    this.find({ active: {$ne: false}});
    next();
});


userSchema.pre('save', async function(next){
    // only run the function if the password is change
    if (!this.isModified('password')) return next();
    //hashing the password of strength 12
    this.password = await bcrypt.hash(this.password, 12);
    // deleting the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000; // due to jwt token it must created before
    next();
});

userSchema.methods.correctPassword = async function(rawPassword, hashedPassword) {
    return await bcrypt.compare(rawPassword, hashedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) { 
    if (this.passwordChangedAt) {
        const changedTimestamp = (this.passwordChangedAt.getTime() / 1000) * 1;
        return JWTTimestamp < changedTimestamp
    };
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.PasswordResetExpires = Date.now() + 10 * 60 * 1000; // add 10 min in milliseconds format
    // console.log(resetToken, this.passwordResetToken);
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;