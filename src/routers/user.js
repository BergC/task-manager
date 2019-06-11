const express = require('express');
const User = require('../models/user');
const authentication = require('../middleware/authentication');
const multer = require('multer');
const sharp = require('sharp');
// Using ES6 destructuring below to get sendWelcomeEmail out of the object it lives in.
const { sendWelcomeEmail } = require('../emails/account');
const { sendCancellationEmail } = require('../emails/account');
const router = new express.Router();

// Router for creating a User.
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save(); // Code within try block below this only runs if save is successful.
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Router for Users logging in.
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

// Router for Users logging out.
router.post('/users/logout', authentication, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send()
    } catch (e) {
        res.status(500).send();
    }
});

// Router to logout all sessions for specific User.
router.post('/users/logoutAll', authentication, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Router for fetching currently authenticated user.
router.get('/users/me', authentication, async (req, res) => {
    res.send(req.user);
});

// Router for updating a User based on ID.
router.patch('/users/me', authentication, async (req, res) => { 
// .patch is designed for updating an existing resource.
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update.'});
    }

    try {      
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch(e) {
        res.status(400).send(e);
    }
});

// Router for deleting a User based on ID.
router.delete('/users/me', authentication, async (req, res) => {
    try {
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

// Multer variable for customizing uploaded files.
const upload = multer({
    // dest: 'avatars', Removing this line allows us to access the data in our router rather than save images to our directory.
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a JPG, JPEG, or PNG file.'));
        }

        // for fileFilter, to send a positive response, use the callback and provide undefined followed by true as the second argument.
        cb(undefined, true); 
    }
});

// Router for uploading a profile picture.
router.post('/users/me/avatar', authentication, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer;
    
    await req.user.save();
    
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

// Router for deleting a profile picture.
router.delete('/users/me/avatar', authentication, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();

    res.send();
});

// Fetching a profile picture and serving up the photo.
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        // res.set() allows to set a response header.
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

module.exports = router;