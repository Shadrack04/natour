const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/auth-controller');
const authMiddleware = require('../middlewares/auth.middleware');

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.patch('/reset-password/:token', resetPassword);
authRouter.patch('/update-password/', authMiddleware, updatePassword);

module.exports = authRouter;
