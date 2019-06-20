const request = require('supertest'); // Supertest uses this naming convention.
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Mongoose allows us to create our own Object ID.
const app = require('../src/app');
const User = require('../src/models/user');

const userOneId = new mongoose.Types.ObjectId();

// Create a user that's always in the database so that we can test functions like logging it.
const userOne = {
    _id: userOneId,
    name: 'Sarah',
    email: 'sarah@example.com',
    password: 'example123',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

// Wipes all users from database and creates a single user before running tests.
beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
});

// Tests creating a user.
test('Should signup a new user', async () => {
    const response = await request(app).post('/users')
        .send({
            name: 'Chris',
            email: 'chris@example.com',
            password: 'example123'
        })
        .expect(201);

    // Assert that the database was changed correctly.
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull() // .toBeNull checks if something is Null while .not reverses that expectation.

    // Assertions about the response.
    expect(response.body).toMatchObject({
        user: {
            name: 'Chris',
            email: 'chris@example.com'
        },
        token: user.tokens[0].token
    });

    // Assert password isn't stored as plain text.
    expect(user.password).not.toBe('example123');
});

// Tests logging in a user.
test('Should login existing user', async () => {
    const response = await request(app).post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200);

    // Asserts a new token is saved when logging in.
    const user = await User.findById(userOneId);

    expect(response.body.token).toBe(user.tokens[1].token);
});

// Tests login failure if credentials are incorrect.
test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login')
        .send({
            email: 'chr!s@example.com',
            password: userOne.password
        })
        .expect(400);
});

// Tests fetching user profile.
test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`) // Authenticates user.
        .send()
        .expect(200);
});

// Tests for a failure if user isn't authenticated and tries to fetch profile.
test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

// Test for deleting account.
test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    
    // Assert the user is removed.
    const user = await User.findById(userOneId);

    expect(user).toBeNull();
});

// Test for failed deletion of account based on unauthenticated user.
test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});

// Test that a profile picture is uploaded.
test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg') // Provided by supertest allowing us to attach files.
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Bob'
        })
        .expect(200);
    
    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Bob');
    
    //expect(response.body.name).not.toBe(userOne.name);
});

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Boston'
        })
        .expect(400);
});