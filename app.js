const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    methodOverride = require("method-override");
    var nodemailer = require('nodemailer');
    var middlewr=require('./middlewares/middleware');
    var compression = require('compression');
    var helmet = require('helmet');
   const User = require("./models/user");
    var dev_db_url='mongodb+srv://user:mypass@qnadb.tioei.mongodb.net/qnadb?retryWrites=true&w=majority'
    var mongoDB=process.env.MONGODB_URI || dev_db_url;


mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB!')).catch(error => console.log(error.message));

app.set("view engine", "ejs");
app.use(compression())
app.use(helmet())
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.locals.moment = require('moment');

app.use(require("express-session")({
    secret: "qwertyuiop",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.get("/", function (req, res) {
    res.render("landing");
});

app.use("/signin",require('./routes/signin'));
app.use('/register',require('./routes/register'));
app.use('/QNA',require('./routes/QNA'));

app.get("/signout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.listen(process.env.PORT||3000, function () {
    console.log("Server has started on port 3000");
});
