/* eslint-disable node/no-unsupported-features/es-syntax */
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');

dotenv.config({ path: './config.env' });

const DB_URL = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const connectDb = async () => {
  await mongoose.connect(DB_URL);
  console.log('connected to database');
};

module.exports = connectDb;
