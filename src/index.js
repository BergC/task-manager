const app = require('./app');

// Set-up port on Heroku or default 3000.
const port = process.env.PORT;

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});