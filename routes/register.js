var express=require('express');
var router=express.Router();
var passport=require('passport');
const User=require('../models/user');

router.get("/", function (req, res) {
    res.render("user/signup")
});

router.post("/", function (req, res) {
    const newUser = new User({ username: req.body.username });
    if (req.body.isTeacher === "true") {
        newUser.isTeacher = true;
    }
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            return res.redirect("/signup");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/QNA");
        })
    });
});
module.exports=router;