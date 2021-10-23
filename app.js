const express = require('express')

const app = express();


app.get('/',(req,res)=>{
    res.send('Api works');
})

module.exports = app;