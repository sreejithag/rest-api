const mongoose = require('mongoose')
const dotenv = require('dotenv');

dotenv.config({
    path: './config.env'
});

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION!!! shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');

const databaseURL = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

//db connection
mongoose.connect(databaseURL).then(con => {
    console.log('DB connected');
}).catch((err)=>{
    console.log('DB connection error',err)
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log('server started');
});


process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION!!!  shutting down ...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});