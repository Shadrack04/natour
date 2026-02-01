const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/auth-controller');

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.patch('/reset-password/:token', resetPassword);

module.exports = authRouter;
