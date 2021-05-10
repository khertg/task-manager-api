const express = require('express');
const app = express();
const cors = require('cors');

//Databases
const connectDatabase = require('./db/mongoose');
connectDatabase();

//Routers
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

app.use(cors());
app.use(express.json());
app.use('/users', userRouter);
app.use('/tasks', taskRouter);

module.exports = app;