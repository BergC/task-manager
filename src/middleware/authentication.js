const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        // req.header() takes the name of the header we want to use.
        const token = req.header('Authorization').replace('Bearer ', ''); 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        /* 
        Because we used _id as the payload in generateAuthToken, decoded variable now has the _id property.
        We use 'tokens.token' to look for a user with a given token value in one of their array values in their tokens array. 
        If the user has logged out with the token provided, it should throw an error.
        */ 
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        // We save the found user to req and our route handlers can access it, instead of looking for the user again.
        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
}

module.exports = auth;