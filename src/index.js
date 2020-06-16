const express = require('express');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');
require('./db/mongoose');

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port,()=>{
    console.log("Server is running on port "+port);
})


// /media/mahfuz/Double/Programming_Zone/Database/mongodb-linux/bin/mongod --dbpath=/media/mahfuz/Double/Programming_Zone/Database/mongodb-data
