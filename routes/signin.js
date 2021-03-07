var express=require('express');
var router=express.Router();
var passport=require('passport');

router.get("/", function (req, res) {
    res.render("user/signin");
});

router.post("/", passport.authenticate("local",
    {
        successRedirect: "/QNA",
        failureRedirect: "/signin"
    }), function (req, res) { }
);
module.exports=router;