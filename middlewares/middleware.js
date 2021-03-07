const Question = require("../models/questions"),
    Comment = require("../models/comments"),
    Answer = require("../models/answer");
module.exports={
    redirectLogin:function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/signin");
    },
    checkQues:function checkQuestionOwnership(req, res, next) {
        // is user logged in
        if (req.isAuthenticated()) {
            Question.findById(req.params.id, function (err, foundQuestion) {
                if (err) {
                    res.redirect("back");
                }
                else {
                    if (foundQuestion.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        res.redirect("back");
                    }
                }
            });
        } else {
            res.redirect("back");
        }
    },
    checkComment:function checkCommentOwnership(req, res, next) {
        // is user logged in
        if (req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, function (err, foundComment) {
                if (err) {
                    res.redirect("back");
                }
                else {
                    if (foundComment.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        res.redirect("back");
                    }
                }
            });
        } else {
            res.redirect("back");
        }
    }
}