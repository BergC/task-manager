const express = require('express');
const Task = require('../models/task');
const router = new express.Router();
const authentication = require('../middleware/authentication');

router.post('/tasks', authentication, async (req, res) => {
    const task = new Task({
        ...req.body, // Uses spread operator to keep all of the values on the request body.
        owner: req.user._id // Creates an owner field with the ID of the person we just authenticated.
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch(e) {
        res.status(400).send(e);
    }
});

// Router for fetching tasks based on request queries.
router.get('/tasks', authentication, async (req, res) => {
    
    const match = {};
    const sort = {};

    // Filter tasks based upon whether the query specifies if task is completed or not.
    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    // Filter tasks based on whether the user wants them ascending or descending.
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,  // Call to our match variable above using shorthand.
            // Options is where we can access limit and skip for pagination.
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort // Sort by 1 for ascending or -1 for descending.
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch(e) {
        res.status(500).send(e);
    }
});

router.get('/tasks/:id', authentication, async (req, res) => {
    const _id = req.params.id;
    
    try {
        const task = await Task.findOne({
            _id, 
            owner: req.user._id // Using ID of authenticated user from authentication.js.
        });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch(e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', authentication, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    const _id = req.params.id;

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update.' });
    }

    try {
        const task = await Task.findOne({ 
            _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/tasks/:id', authentication, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
});

module.exports = router;