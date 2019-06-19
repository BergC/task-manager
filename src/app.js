const express = require('express');
require('./db/mongoose'); // Ensures that mongoose runs and connects to our database.
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

// Parse incoming JSON to an object so we can access via our handlers (e.g. req.body).
app.use(express.json());

// Register User router.
app.use(userRouter);

// Register Task router.
app.use(taskRouter);

module.exports = app;