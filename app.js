const express = require('express');
require('express-async-errors');    // Used for handling errors
const app = express();
const mongoose = require('mongoose');
const { MONGOURI } = require('./config/keys');
const error = require('./middleware/error');
const cors = require('cors')


mongoose.connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB!');
});
mongoose.connection.on('error', (e) => {
    console.log('Error: Could not connect to MongoDB!', e);
});


// require('./models/user');
require('./models/post');

app.use(cors())
app.use(express.json());
app.use(require('./routes/auth'));
app.use(require('./routes/post'));
app.use(require('./routes/user'));

// Error Handling when we get an internal error
app.use(error);


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV==="production") {
    app.use(express.static('client/build'));
    const path = require('path');
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});