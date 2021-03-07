var express=require('express');
var request=require('request')
var http=require('http')
var router=express.Router();
var middlewr=require('../middlewares/middleware');
const Question = require("../models/questions"),
    Comment = require("../models/comments"),
    Answer = require("../models/answer");
function makeRequest(postData,ques_id){
    var options = {
        host: 'localhost',
        port: 5000,
        path: '/QNA',
        body: JSON.stringify(postData),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    console.log(JSON.stringify(postData))
    var req = http.request(options, (res) => {
        var data = '';
        res.on('data', (chunk) => {
            data += chunk.toString(); // buffer to string
        });
        res.on('end', () => {
            console.log(data)
            if(data.length!=0)
            {
                data=data.substring(1);
                result=data.split(",",-1);
                Question.findById(ques_id,function(err,question){
                        if(err)
                        {
                            console.log(err);
                            return;
                        }
                        else{
                            for (let index = 0; index < result.length; index++) {
                                const element = result[index];
                                question.tags.push(element);
                            }
                            question.save();
                        }
                });
                
            }
            console.log('No more data in response.');
        });
    });
    req.write(JSON.stringify(postData))
    req.end();
}
router.get("/", function (req, res) {
    Question.find({}).populate({path:"answer"}).exec(function (err, allQuestion) {
        if (err) {
            console.log(err);
        } else {
            console.log(allQuestion)
            allQuestion.sort((a, b) => (a.answer > b.answer) ? 1 : (a.answer === b.answer) ? ((a.created > b.created) ? 1 : -1) : -1 )
            res.render("questions/index", { question: allQuestion });
        }
    })
});

router.get("/new", middlewr.redirectLogin, function (req, res) {
    
    res.render("questions/new");
});
router.get("/search/:content",function(req,res){
         var query={question:new RegExp(req.params.content,'i')};
         Question.find(query,function(err,allQuestion)
         {
             var resp="";
             if(err)
             {
                 resp="<h3>Sorry,No matches found</h3>";
             }
             else
             {  
                allQuestion.forEach(element => {
                     resp=resp+"<div class='card text-center' style='margin: 14px; width: 99%;'>"+
                    "<div class='card-header'>"+
                    "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='#F6811A' class='bi bi-clock' viewBox='0 0 16 16'>"+
                    "<path d='M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z'/>"+
                    "<path d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z'/>"+
                  "</svg>"+
                    element.created.toDateString()+
                    "</div>"+
                    "<div class='card-body'>"+
                      "<h5 class='card-title'>"+element.subject+"</h5>"+
                      "<p class='card-text'>"+element.question+"</p>"+
                      "<a href='/QNA/"+element._id+"'class='btn btn-primary'>More Info</a>"+
                    "</div>"+
                    "<div class='card-footer text-muted'>"+
                    "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='#1A6DF6' class='bi bi-pen-fill' viewBox='0 0 16 16'>"+
          "<path d='M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001z'/>"+
        "</svg>"+
                    element.author.username+
                    "</div>"+
                  "</div>"
                });
             }
         res.send(resp);
        });
});
router.post("/", middlewr.redirectLogin, function (req, res) {
    let question = req.body.question;
    let description = req.body.description;
    let subject = req.body.subject;
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    let newCampGround = { question: question, subject: subject, description: description, author: author };
    Question.create(newCampGround, function (err, newQuestion) {
        if (err) {
            console.log(err);
        } else {
            newQuestion.save();
            makeRequest({title:question},newQuestion._id);
            res.redirect("/QNA");
        }
    });
});

router.get("/:id", function (req, res) {
    Question.findById(req.params.id).populate("answer").populate("comments").exec(function (err, foundQuestion) {
        if (err) {
            console.log(err);
        } else {
            res.render("questions/show", { question: foundQuestion });
        }
    });
});

router.get("/:id/edit", middlewr.checkQues, function (req, res) {
    Question.findById(req.params.id, function (err, foundQuestion) {
        res.render("questions/edit", { question: foundQuestion });
    });
});

router.put("/:id", middlewr.checkQues, function (req, res) {
    Question.findByIdAndUpdate(req.params.id, req.body.question, function (err, updatedQuestion) {
        if (err) {
            res.redirect("/QNA");
        } else {
            res.redirect("/QNA/" + req.params.id);
        }
    });
});

router.delete("/:id", middlewr.checkQues, function (req, res) {
    Question.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/QNA");
        } else {
            res.redirect("/QNA");
        }
    });
});


router.post("/:id/comments", middlewr.redirectLogin, function (req, res) {
    Question.findById(req.params.id, function (err, question) {
        if (err) {
            console.log(err);
            res.redirect("/QNA");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                    res.redirect('/QNA/' + question._id + '/comments/new');
                } else {
                    
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    
                    comment.save();
                    question.comments.push(comment);
                    question.save();
                    res.redirect('/QNA/' + question._id);
                }
            });
        }
    });
});

router.put("/:id/comments/:comment_id", middlewr.checkComment, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/QNA/" + req.params.id);
        }
    });
});

router.delete("/:id/comments/:comment_id", middlewr.checkComment, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/QNA/" + req.params.id);
        }
    });
});

router.get("/:id/answer/new", function (req, res) {
    Question.findById(req.params.id, function (err, question) {
        if (err) {
            console.log(err);
        } else {
            res.render("answer/new", { question: question });
        }
    });
});

router.post("/:id/answer", middlewr.redirectLogin, function (req, res) {
    Question.findById(req.params.id, function (err, question) {
        if (err) {
            console.log(err);
            res.redirect("/QNA");
        } else {
            Answer.create(req.body.answer, function (err, answer) {
                if (err) {
                    console.log(err);
                    res.redirect('/QNA/' + question._id + '/answer/new');
                } else {
                    answer.author.id = req.user._id;
                    answer.author.username = req.user.username;
                    // Save Answer
                    answer.save();
                    question.answer.push(answer);
                    question.save();
                    res.redirect('/QNA/' + question._id);
                }
            });
        }
    });
});

router.get("/:id/answer/:answer_id/edit", function (req, res) {
    Answer.findById(req.params.answer_id, function (err, foundAnswer) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("answer/edit", { question_id: req.params.id, answer: foundAnswer });
        }
    });
});

router.put("/:id/answer/:answer_id", function (req, res) {
    Answer.findByIdAndUpdate(req.params.answer_id, req.body.answer, function (err, updatedAnswer) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/QNA/" + req.params.id);
        }
    });
});

router.delete("/:id/answer/:answer_id", function (req, res) {
    Answer.findByIdAndRemove(req.params.answer_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/QNA/" + req.params.id);
        }
    });
});
module.exports=router;