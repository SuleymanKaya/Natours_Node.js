const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './.env'});


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
app.listen(port, () => {
    console.log('Listening on port 3000');
});