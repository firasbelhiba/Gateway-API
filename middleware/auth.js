const jwt = require('jsonwebtoken');
const config = require('config');


//@author Firas Belhiba
//@desc middleware responsible for token verification ( Private methods ) (Authorization)
module.exports = function (req, res, next) {

    // Get token from header ( when we send a request to a prootected route we need this middleware)
    const token = req.header('x-auth-token');

    // Check the existence of the token 
    if (!token) {
        return res.status(401).json({ message: 'No token found ! ' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();

    } catch (e) {
        res.status(401).json({ message: 'Token is invalid' });
    }

}