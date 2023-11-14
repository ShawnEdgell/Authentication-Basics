const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require('path');
require('dotenv').config();

// Passport configuration
require('./config/passport')(passport);

// Connect to MongoDB
const mongoDb = process.env.DB_URI;
mongoose.connect(mongoDb, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Importing Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const messagesRouter = require('./routes/messages');

const app = express();

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Express Session
app.use(session({ 
    secret: "cats", 
    resave: false, 
    saveUninitialized: true 
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Express BodyParser
app.use(express.urlencoded({ extended: false }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Custom middleware to make user info available in templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Using Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);

// Error Handling Middleware (Optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Starting the Server
app.listen(3000, () => console.log("Server started on port 3000"));

