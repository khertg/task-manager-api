const mongoose = require('mongoose');
const chalk = require('chalk');

const connectDatabase = async () => {
  await mongoose
    .connect(process.env.MONGODB_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() =>
      console.log(chalk.white.bgGreen.bold('MongoDB is connected...'))
    )
    .catch((err) =>
      console.log(chalk.white.bgRed.bold('Cannot connect to MongoDB...'))
    );
};

module.exports = connectDatabase;
