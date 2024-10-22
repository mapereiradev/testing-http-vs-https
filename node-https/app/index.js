const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');

const app = express();
const port = process.env.PORT || 8080;

// Use bodyParser to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve a simple form for both HTTP and HTTPS
app.get('/', (req, res) => {
    res.send(`
        <form action="/submit" method="POST">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name">
            <button type="submit">Submit</button>
        </form>
    `);
});

app.post('/submit', (req, res) => {
    const { name } = req.body;
    res.send(`<h1>Hello, ${name}! Your form data was received.</h1>`);
});

// Starting the server for HTTP or HTTPS
if (process.env.HTTPS === 'true') {
    const options = {
        key: fs.readFileSync('ssl/server.key'),
        cert: fs.readFileSync('ssl/server.crt')
    };

    https.createServer(options, app).listen(port, () => {
        console.log(`HTTPS server is running on port ${port}`);
    });
} else {
    app.listen(port, () => {
        console.log(`HTTP server is running on port ${port}`);
    });
}
