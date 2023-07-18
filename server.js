const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './.env'});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log('Name:', err.name, '|', 'Message:', err.message);
    process.exit(1);
});

const DATABASE_URL = process.env.DATABASE_URL.replace("<DB_PASSWORD>", process.env.DB_PASSWORD);
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
}).then(con => {
    console.log(con.connections);
    console.log("Connected to Database");
});

const app = require('./app');

const port = 3000;
const server = app.listen(port, () => {
    console.log('Listening on port 3000');
});

// Handle unhandled rejections
process.on('unhandledRejection', err => {
    console.log('Name:', err.name, '|', 'Message:', err.message);
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    server.close(() => {
        process.exit(1);
    });
});

// console.log(x); // This will cause an uncaught exception