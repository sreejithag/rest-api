const express = require('express')
const bodyParser = require('body-parser');
const scheduleRoute = require('./routes/schedulesRoute')
const blockappRoute = require('./routes/blockappsRoute');
const restrictAppRoute = require('./routes/restrictAppRoute');

const app = express();

//middleware stubs user id,
//for simplicity hardcorded user id for all requests
stubUserID = (req,res,next)=>{
    req.user = "617503c5e3e4a6918c5ae1e8";
    next();
}

app.use(stubUserID);
app.use(express.json());

app.use('/api/v1/schedule',scheduleRoute);
app.use('/api/v1/blockapp',blockappRoute);
app.use('/api/v1/restrict',restrictAppRoute);


app.get('/',(req,res)=>{
    res.send('Api works');
})

module.exports = app;