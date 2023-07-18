const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./router/tourRouter');
const userRouter = require('./router/userRouter');


const app = express();

app.use(express.json());


if (process.env.NODE_ENV === 'development') {
    console.log(process.env.NODE_ENV);
    app.use(morgan('dev'));
}

// Frontend
app.use(express.static(`${__dirname}/public`));

// Backend
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error handling
// URL not found
app.all('*', (req,res,next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
