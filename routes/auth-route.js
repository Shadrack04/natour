const express = require('express');
const {
  signup,
  login,
  forgotPassword
} = require('../controllers/auth-controller');

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);

module.exports = authRouter;
