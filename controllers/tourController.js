const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require("./../utils/appError");

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}


exports.getAllTours = catchAsync(async (req, res, next) => {
    /*
    Query Logic:
            // // 1) Filtering
        // const queryObj = {...req.query};
        // const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // excludedFields.forEach(el => delete queryObj[el]);
        //
        // // 2) Advanced Filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // let query = Tour.find(JSON.parse(queryStr));  // mongoose query

        // // 3) Sorting
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     console.log(sortBy);
        //     query = query.sort(sortBy);
        // }
        // else {
        //     query = query.sort('-createdAt');
        // }

        // // 4) Field Limiting
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     console.log(fields);
        //     query = query.select(fields);
        // }
        // else {
        //     query = query.select('-__v');
        // }

        // // 5) Pagination
        // const page = req.query.page * 1 || 1; // default page 1 and multiply by 1 to convert string to number
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;
        // console.log(page, limit, skip);
        // query = query.skip(skip).limit(limit);
        //
        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip >= numTours) {
        //         throw new Error('This page does not exist');
        //     }
        // }
     */
    // Execute query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;

    res.status(200).json({
        status: 'Success', results: tours.length, data: {
            tours: tours
        }
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'Success', data: {
            tour: tour
        }
    });
});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'Success', data: {
            tour: newTour
        }
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'Success', data: {
            tour: tour
        }
    });
});

exports.partialUpdateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!tour) {
            return next(new AppError('No tour found with that ID', 404));
        }

        res.status(200).json({
            status: 'Success', data: {
                tour: tour
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'Fail', message: err
        });
    }
}

exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);
        if (!tour) {
            return next(new AppError('No tour found with that ID', 404));
        }
        res.status(204).json({
            status: 'Success', data: null,
        });
    } catch (err) {
        res.status(404).json({
            status: 'Fail', message: err
        });
    }
}

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([{
            $match: {ratingsAverage: {$gte: 4.5}}
        }, {
            $group: {
                _id: '$duration', // group by duration values and for all Tour collection it will be null
                numTours: {$sum: 1},
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}
            }
        }, {
            $sort: {avgPrice: 1} // 1 for ascending
        }, {
            $match: {_id: {$gte: 13}} // filter out documents with _id less than 13
        },]);
        res.status(200).json({
            status: 'Success', data: {
                stats: stats
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'Fail', message: err
        });
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([{
            $unwind: '$startDates' // deconstructs an array field from the input documents to output a document for each element
        }, {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`), // 2021-01-01
                    $lte: new Date(`${year}-12-31`) // 2021-12-31
                }
            }
        }, {
            $group: {
                _id: {$month: '$startDates'}, numTourStarts: {$sum: 1}, tours: {$push: '$name'}
            }
        }, {
            $addFields: {month: '$_id'}
        }, {
            $project: {
                _id: 0 // 0 means hide
            }
        }, {
            $sort: {numTourStarts: -1} // -1 for descending
        }, {
            $limit: 2
        }]);

        res.status(200).json({
            status: 'Success', data: {
                plan: plan
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'Fail', message: err
        });
    }
}