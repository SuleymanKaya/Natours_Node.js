const express = require('express');
const tourController = require('../controllers/tourController');

const tourRouter = express.Router();

tourRouter
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);
tourRouter
    .route('/:id')
    .get(tourController.getTour)
    .put(tourController.updateTour)
    .patch(tourController.partialUpdateTour)
    .delete(tourController.deleteTour);


module.exports = tourRouter;
