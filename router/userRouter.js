const express = require("express");
const userController = require("../controllers/userController");

const userRouter = express.Router();


userRouter
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
userRouter
    .route('/:id')
    .get(userController.getUser);


module.exports = userRouter;