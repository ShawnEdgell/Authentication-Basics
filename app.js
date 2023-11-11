const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const path = require('path');
require('dotenv').config();

const mongoose = require('mongoose');

// Connect to MongoDB
const mongoDb = process.env.DB_URI;
mongoose.connect(mongoDb, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));
// User Schema
const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
  })
);

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Express Session Setup
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

// Passport Configuration
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      };
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  };
});

app.use(passport.initialize());
app.use(passport.session());

// Custom middleware to make user info available in templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post("/sign-up", async (req, res, next) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        password: hashedPassword
      });
      await user.save();
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  });

app.post("/log-in", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/"
}));

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

// Starting the Server
app.listen(3000, () => console.log("app listening on port 3000!"));
