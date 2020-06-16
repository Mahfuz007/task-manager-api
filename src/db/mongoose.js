const mongoose = require('mongoose');
const validetor = require('validator')

mongoose.connect(process.env.DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}) 