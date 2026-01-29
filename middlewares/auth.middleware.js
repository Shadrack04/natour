/* eslint-disable node/no-unsupported-features/es-syntax */
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith('Bearer ')) {
      token = authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Unauthorized');
      error.statusCode = 401;
      throw error;
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // if (!decoded) {
    //   const error = new Error('Invalid or expired token');
    //   error.statusCode = 401;
    //   throw error;
    // }

    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('Unauthorized');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
