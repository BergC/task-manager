const mongoose = require('mongoose'); // Allows us to create our own ID.
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

// Create permanent users.
const userOneId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: 'Sarah',
    email: 'sarah@example.com',
    password: 'example123',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId();

const userTwo = {
    _id: userTwoId,
    name: 'Evan',
    email: 'evan@example.com',
    password: 'example123',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

// Create a persistent task.
const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Testing 1 2 3!',
    completed: false,
    owner: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Testing 3 2 1!',
    completed: true,
    owner: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Testing 3rd!',
    completed: true,
    owner: userTwoId
}

// Sets up the database with the task and user above.
const setupDatabase = async () => {
    // Wipes all users and tasks from database.
    await User.deleteMany();
    await Task.deleteMany();

    // Saves the two users.
    await new User(userOne).save();
    await new User(userTwo).save();

    // Saves the two tasks.
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
};