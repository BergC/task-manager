const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

// First argument to our Schema is an object with our fields. Second argument are Schema options.
const userSchema = new mongoose.Schema({
    // Within the objects below we setup the properties (e.g. validation, type).
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.');
            }
        }
    },
    email: {
        type: String,
        unique: true, // Ensures e-mails can't be repeated when creating a User.
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error('Come on now... make it a litte more diffult.');
            }
        }
    },
    tokens: [{
        // This will be a sub-document in MongoDB with its own _id.
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    // Timestamps creates a createdAt and updatedAt timestamp.
    timestamps: true
});


// Virtual property.  Mongoose uses .virtual to see how these things are related. The name could be anything, I chose tasks because we're creating a virtual tasks property on each User to tell us what tasks are associated with that User.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', // Where the local data is stored.  We have the 'owner' object on each task associated with the _id.
    foreignField: 'owner' // Name of the field on the other thing (e.g. owner of the task that we created in our Task model) that creates the relationship. We already set it up as 'owner'.
});

// Hide personal data in response to client.
userSchema.methods.toJSON = function() {
    const user = this;
    
    // Raw object with user data attached. toObject is a Mongoose method.
    const userObject = user.toObject();

    // Now the user data is a object that can be manipulated. Below we delete sensitive data.
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

// Generate authentication token. Methods accessible on the instances (e.g. individual user).
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token
} 

// Facilitate login by finding User based on email and password. Statics are accessible on the model (e.g. User).
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login.');
    }

    // bcrypt.compare() compares the provided password and the user's hashed password.
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login.');
    }

    return user;
}

// Hash plain text password before saving.
userSchema.pre('save', async function(next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Delete user's tasks when user is removed.
userSchema.pre('remove', async function(next) {
    const user = this;

    await Task.deleteMany({ owner: user._id }); // Delete every task where the owner value equals the user's ID.

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;