const app = require('./app');
const chalk = require('chalk');
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(
    chalk.white.bgGreen.bold('Server is up on PORT = ') +
      chalk.white.bgBlue.bold(PORT)
  );
});
