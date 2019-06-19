const request = require('supertest'); // Supertest uses this naming convention.
const app = require('../src/app');
const User = require('../src/models/user');

// Create a user that's always in the database so that we can test functions like logging it.
const userOne = {
    name: 'Sarah',
    email: 'sarah@example.com',
    password: 'example123'
}

// Wipes all users from database and creates a single user before running tests.
beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
});

// Tests creating a user.
test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Chris',
        email: 'chris@example.com',
        password: 'example123'
    }).expect(201);
});

// Tests logging in a user.
test('Should login existing user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);
});

// Tests login failure if credentials are incorrect.
test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'chr!s@example.com',
        password: userOne.password
    }).expect(400);
});