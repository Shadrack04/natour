const fs = require('fs');

const express = require('express');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
const Tour = require('../model/tours.model');

dotenv.config({ path: './config.env' });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours-simple.json`)
);
const app = express();

const DB_URL = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
const connectDb = async () => {
  await mongoose.connect(DB_URL);
  console.log('connected to database');
};

const port = 5000;
// eslint-disable-next-line node/no-unsupported-features/es-syntax
app.listen(port, async () => {
  console.log(`App running on port ${port}...`);
  await connectDb();
});

console.log(process.argv);

// eslint-disable-next-line node/no-unsupported-features/es-syntax
const importData = async (req, res) => {
  try {
    const tour = await Tour.create(tours);

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    });
  } finally {
    process.exit();
  }
};
// eslint-disable-next-line node/no-unsupported-features/es-syntax
const deleteData = async (req, res) => {
  try {
    await Tour.deleteMany();

    res.status(200).json({
      status: 'success',
      data: {
        message: 'All tours deleted'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    });
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteData();
}
