/* eslint-disable node/no-unsupported-features/es-syntax */
const fs = require('fs');
const Tour = require('../model/tours.model');
const APIFeatures = require('../helpers/api-features');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllTours = async (req, res) => {
  // const queryObj = { ...req.query };
  // const excludeQuery = ['page', 'fields', 'limit', 'sort'];
  // excludeQuery.forEach(el => delete queryObj[el]);

  // let queryString = JSON.stringify(queryObj);
  // queryString = queryString.replace(
  //   /\b(gte|gt|lte|lt)\b/g,
  //   match => `$${match}`
  // );
  // let query = Tour.find(JSON.parse(queryString));

  // sort
  // if (req.query.sort) {
  //   console.log(req.query.sort);
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   console.log(sortBy);
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }

  // fields limiting
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v');
  // }

  // pagination
  // if (req.query.page) {
  //   const limit = req.query.limit * 1 || 3;
  //   const page = req.query.page * 1 || 1;
  //   const skip = limit * (page - 1);

  //   query = query.skip(skip).limit(limit);
  // }

  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();

  const result = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: result.length,
    data: {
      tours: result
    }
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.deleteTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Tour.findByIdAndDelete(id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.getTourStats = async (req, res) => {};
