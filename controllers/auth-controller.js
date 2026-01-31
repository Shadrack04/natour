const { default: mongoose } = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const sendEmail = require('../helpers/email');

dotenv.config({ path: './config.env' });

/* eslint-disable node/no-unsupported-features/es-syntax */

const signJwt = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      photo,
      passwordLastUpdateAt
    } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      const error = new Error('Provide all required data');
      error.statusCode = 400;
      throw error;
    }

    // check if user already exist
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('User already exist with this email');
      error.statusCode = 409;
      throw error;
    }

    // create and new user
    const [user] = await User.create(
      [
        {
          name,
          email,
          password,
          confirmPassword,
          photo,
          passwordLastUpdateAt
        }
      ],
      { session }
    );

    // generate jwt token
    if (!process.env.JWT_SECRET) {
      const error = new Error('Jwt secret cannot be undefined');
      error.statusCode = 500;
      throw error;
    }
    const token = signJwt(user._id);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Please enter the your and email and password');
      error.statusCode = 400;
      throw error;
    }

    // try fetching the user via email
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      const error = new Error('Enter a correct email or password');
      error.statusCode = 401;
      throw error;
    }

    user.password = undefined;

    const token = signJwt(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('No user with this email');
      error.statusCode = 404;
      throw error;
    }

    // create reset token
    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: 'Reset Password',
      message: `hello from Natours, ${resetToken}`
    });

    res.status(200).json({
      success: true,
      message: 'Reset Token sent to your email'
    });
  } catch (error) {
    next(error);
  }
};
