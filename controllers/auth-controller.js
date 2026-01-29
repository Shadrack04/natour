const { default: mongoose } = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

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
