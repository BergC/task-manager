const mongoose = require('mongoose');

// Unlike MongoDB connections, we specify the database name in the URL argument.
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true, // When Mongoose works with MongoDB our indexes are created, allows us to quickly access data.
    useFindAndModify: false
});