const express = require('express');
const router = express.Router();
const User = require("../../models/User");
const Question = require("../../models/Question");


//@author Motez Ayari
//@Route GET api/users
// @Description  Test route
// @Access Public

//getAllQuestions
router.get('/', (req, res) => {
        Question.find().then(Questions => res.json(Questions))
            .catch(err => res.status(400).json('error: ' + err));
    }
);

router.get('/followed/:idU', (req, res) => {
        Question.find().then(Questions =>
            console.log(Questions.following.includes(req.params.idU))
        )
            .catch(err => res.status(400).json('error: ' + err));
    }
);


//FindQuestionByID
router.get('/:id', (req, res) => {
        Question.findById(req.params.id).then(Question => res.json(Question))
            .catch(err => res.status(400).json('error: ' + err));
    }
);

//DeleteQuestion
router.delete('/delete/:id', (req, res) => {
        Question.findByIdAndDelete(req.params.id).then(
            Question.find().then(Questions =>
                res.json(Questions))
                .catch(err =>
                    res.status(400).json('error: ' + err)
                )
                .catch(err => res.status(400).json('error: ' + err)));
    }
);

//UpdateQuestion
router.post('/update/:id', (req, res) => {
        Question.findById(req.params.id).then(Question => {
            Question.subject = req.body.subject;
            Question.description = req.body.description;
            Question.category = req.body.category;
            Question.tags = req.body.tags;

            Question.save().then(() => {
                res.json('Question updated!');
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

//AddQuestion
router.post('/add', (req, res) => {
        const user = req.body.user
        const subject = req.body.subject
        const description = req.body.description
        const category = req.body.category
        const tags = req.body.tags
        const date = new Date();

        const newQuestion = new Question({
            user,
            subject,
            description,
            category,
            tags,
            date,
        });
        newQuestion.save().then(() => {
            Question.find().then(Questions =>
                res.json(Questions)
            ).catch(err =>
                res.status(400).json('error: ' + err)
            );
        }).catch(err => {
            res.status(400).json('error: ' + err);
        })
    }
)
// add Answer
router.post('/answer/:id', (req, res) => {
        Question.findById(req.params.id).then(Question => {
            const newAnswer = {
                user: req.body.user,
                description: req.body.description,
                date: req.body.date,
            };

            Question.answers.push(newAnswer);

            Question.save().then(() => {
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

// add reply
router.post('/:idQ/reply/:idA', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const newReply = {
                user: req.body.user,
                description: req.body.reply,
                date: req.body.date,
            };
            Question.answers.find((answer) => answer.id === req.params.idA).replies.push(newReply);
            Question.save().then(() => {
                res.json(Question);
                console.log(req.body)
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

// add solution
router.post('/:idQ/solve/:idA', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            Question.solved = !Question.solved;
            Question.answers.find((answer) => answer.id === req.params.idA).solution
                = !Question.answers.find((answer) => answer.id === req.params.idA).solution;

            Question.save().then(() => {
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

// add solution
router.post('/:idQ/upVote/:idU', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const vote = {
                user: req.params.idU,
            }

            var UpVotes = [];
            for (var i in Question.upVotes)
                UpVotes.push(Question.upVotes[i].user.toString());

            var DownVote = [];
            for (var i in Question.downVotes)
                DownVote.push(Question.downVotes[i].user.toString());

            if (UpVotes.includes(req.params.idU)) {
                console.log('exist');
                const userIndex = Question.upVotes
                    .map((up => up.user.toString()))
                    .indexOf(req.params.idU);
                console.log(userIndex);
                Question.upVotes.splice(userIndex, 1);
            } else {
                if (DownVote.includes(req.params.idU)) {
                    const userDeleteIndex = Question.downVotes
                        .map((up => up.user.toString()))
                        .indexOf(req.params.idU);
                    console.log(userDeleteIndex);
                    Question.downVotes.splice(userDeleteIndex, 1);
                }
                console.log('doesnt exist')
                Question.upVotes.push(vote);
            }
            Question.save().then(() => {
                console.log('upVoted Answer');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.post('/:idQ/downVote/:idU', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const vote = {
                user: req.params.idU,
            }

            var DownVote = [];
            for (var i in Question.downVotes)
                DownVote.push(Question.downVotes[i].user.toString());

            var UpVotes = [];
            for (var i in Question.upVotes)
                UpVotes.push(Question.upVotes[i].user.toString());

            if (DownVote.includes(req.params.idU)) {
                console.log('exist');
                const userIndex = Question.downVotes
                    .map((up => up.user.toString()))
                    .indexOf(req.params.idU);
                console.log(userIndex);
                Question.downVotes.splice(userIndex, 1);
            } else {
                if (UpVotes.includes(req.params.idU)) {
                    const userDeleteIndex = Question.upVotes
                        .map((up => up.user.toString()))
                        .indexOf(req.params.idU);
                    console.log(userDeleteIndex);
                    Question.upVotes.splice(userDeleteIndex, 1);
                }
                console.log('doesnt exist')
                Question.downVotes.push(vote);
            }
            Question.save().then(() => {
                console.log('downVotes Answer');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.post('/:idQ/answerReport/:idA', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const newReport = {
                user: req.body.user,
                reason: req.body.reason,
            };
            Question.answers.find((answer) => answer.id === req.params.idA).reports.push(newReport);

            Question.save().then(() => {
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.post('/:idQ/deleteAnswer/:idA', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {

            const removeIndex = Question.answers
                .map((answer) => answer.user.toString())
                .indexOf(req.params.idA);

            Question.answers.splice(removeIndex, 1);

            Question.save().then(() => {
                console.log('answer deleted');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.post('/:idQ/deleteReply/:idA/:idR', (req, res) => {
    Question.findById(req.params.idQ).then(Question => {

        const answerIndex = Question.answers
            .map((answer) => answer._id.toString())
            .indexOf(req.params.idA);
        const replyIndex = Question.answers[answerIndex].replies
            .map((reply => reply._id.toString()))
            .indexOf(req.params.idR);
        Question.answers[answerIndex].replies.splice(replyIndex, 1);
        Question.save().then(() => {
            console.log('reply deleted');
            res.json(Question);
        }).catch(err => {
            res.status(400).json('error: ' + err);
        })
    }).catch(err => res.status(400).json('error: ' + err));
});

router.get('/:idQ/:sort/sortAnswers', (req, res) => {
    Question.findById(req.params.idQ).then(Question => {
        const QuestionSorted = Question;

        if (req.params.sort === 'dsc') {
            QuestionSorted.answers.sort((a, b) => {
                return new Date(a.date) - new Date(b.date); // descending
            })
        }
        if (req.params.sort === 'asc') {
            QuestionSorted.answers.sort((a, b) => {
                return new Date(b.date) - new Date(a.date); // ascending
            });
        }
        res.json(QuestionSorted);
    }).catch(err => res.status(400).json('error: ' + err));
});

router.get('/:idQ/sortByVotesAnswers', (req, res) => {
    Question.findById(req.params.idQ).then(Question => {
        const QuestionSorted = Question;

        QuestionSorted.answers.sort((a, b) => {
            var UpVotesa = [];
            for (var i in a.upVotes)
                UpVotesa.push(a.upVotes[i].user.toString());

            var DownVotea = [];
            for (var i in a.downVotes)
                DownVotea.push(a.downVotes[i].user.toString());

            var UpVotesb = [];
            for (var i in b.upVotes)
                UpVotesb.push(b.upVotes[i].user.toString());

            var DownVoteb = [];
            for (var i in b.downVotes)
                DownVoteb.push(b.downVotes[i].user.toString());

            return (UpVotesb.length - DownVoteb.length) - (UpVotesa.length - DownVotea.length);
        });

        res.json(QuestionSorted);
    }).catch(err => res.status(400).json('error: ' + err));
});

router.post('/:idQ/:idA/upVoteAnswer/:idU', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const vote = {
                user: req.params.idU,
            }
            const Index = Question.answers
                .map((answer) => answer._id.toString())
                .indexOf(req.params.idA);

            var UpVotes = [];
            for (var i in Question.answers[Index].upVotes)
                UpVotes.push(Question.answers[Index].upVotes[i].user.toString());

            var DownVote = [];
            for (var i in Question.answers[Index].downVotes)
                DownVote.push(Question.answers[Index].downVotes[i].user.toString());

            if (UpVotes.includes(req.params.idU)) {
                console.log('exist');
                const userIndex = Question.answers[Index].upVotes
                    .map((up => up.user.toString()))
                    .indexOf(req.params.idU);
                console.log(userIndex);
                Question.answers[Index].upVotes.splice(userIndex, 1);
            } else {
                if (DownVote.includes(req.params.idU)) {
                    const userDeleteIndex = Question.answers[Index].downVotes
                        .map((up => up.user.toString()))
                        .indexOf(req.params.idU);
                    console.log(userDeleteIndex);
                    Question.answers[Index].downVotes.splice(userDeleteIndex, 1);
                }
                console.log('doesnt exist')
                Question.answers[Index].upVotes.push(vote);
            }
            Question.save().then(() => {
                console.log('upVoted Answer');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.post('/:idQ/:idA/downVoteAnswer/:idU', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const vote = {
                user: req.params.idU,
            }
            const Index = Question.answers
                .map((answer) => answer._id.toString())
                .indexOf(req.params.idA);

            var DownVote = [];
            for (var i in Question.answers[Index].downVotes)
                DownVote.push(Question.answers[Index].downVotes[i].user.toString());

            var UpVotes = [];
            for (var i in Question.answers[Index].upVotes)
                UpVotes.push(Question.answers[Index].upVotes[i].user.toString());

            if (DownVote.includes(req.params.idU)) {
                console.log('exist');
                const userIndex = Question.answers[Index].downVotes
                    .map((up => up.user.toString()))
                    .indexOf(req.params.idU);
                console.log(userIndex);
                Question.answers[Index].downVotes.splice(userIndex, 1);
            } else {
                if (UpVotes.includes(req.params.idU)) {
                    const userDeleteIndex = Question.answers[Index].upVotes
                        .map((up => up.user.toString()))
                        .indexOf(req.params.idU);
                    console.log(userDeleteIndex);
                    Question.answers[Index].upVotes.splice(userDeleteIndex, 1);
                }
                console.log('doesnt exist')
                Question.answers[Index].downVotes.push(vote);
            }
            Question.save().then(() => {
                console.log('downVotes Answer');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);
router.post('/:idQ/:idA/:idR/upVoteReply/:idU', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const vote = {
                user: req.params.idU,
            }
            const Index = Question.answers
                .map((answer) => answer._id.toString())
                .indexOf(req.params.idA);
            const replyIndex = Question.answers[Index].replies
                .map((reply => reply._id.toString()))
                .indexOf(req.params.idR);

            var UpVotes = [];
            for (var i in Question.answers[Index].replies[replyIndex].upVotes)
                UpVotes.push(Question.answers[Index].replies[replyIndex].upVotes[i].user.toString());

            var DownVote = [];
            for (var i in Question.answers[Index].replies[replyIndex].downVotes)
                DownVote.push(Question.answers[Index].replies[replyIndex].downVotes[i].user.toString());

            if (UpVotes.includes(req.params.idU)) {
                console.log('exist');
                const userIndex = Question.answers[Index].replies[replyIndex].upVotes
                    .map((up => up.user.toString()))
                    .indexOf(req.params.idU);
                console.log(userIndex);
                Question.answers[Index].replies[replyIndex].upVotes.splice(userIndex, 1);
            } else {
                if (DownVote.includes(req.params.idU)) {
                    const userDeleteIndex = Question.answers[Index].replies[replyIndex].downVotes
                        .map((up => up.user.toString()))
                        .indexOf(req.params.idU);
                    console.log(userDeleteIndex);
                    Question.answers[Index].replies[replyIndex].downVotes.splice(userDeleteIndex, 1);
                }
                console.log('doesnt exist')
                Question.answers[Index].replies[replyIndex].upVotes.push(vote);
            }
            Question.save().then(() => {
                console.log('upVoted Reply');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.post('/:idQ/:idA/:idR/downVoteReply/:idU', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const vote = {
                user: req.params.idU,
            }
            const Index = Question.answers
                .map((answer) => answer._id.toString())
                .indexOf(req.params.idA);
            const replyIndex = Question.answers[Index].replies
                .map((reply => reply._id.toString()))
                .indexOf(req.params.idR);

            var DownVote = [];
            for (var i in Question.answers[Index].replies[replyIndex].downVotes)
                DownVote.push(Question.answers[Index].replies[replyIndex].user.toString());

            var UpVotes = [];
            for (var i in Question.answers[Index].replies[replyIndex].upVotes)
                UpVotes.push(Question.answers[Index].replies[replyIndex].user.toString());

            if (DownVote.includes(req.params.idU)) {
                console.log('exist');
                const userIndex = Question.answers[Index].replies[replyIndex].downVotes
                    .map((up => up.user.toString()))
                    .indexOf(req.params.idU);
                console.log(userIndex);
                Question.answers[Index].replies[replyIndex].splice(userIndex, 1);
            } else {
                if (UpVotes.includes(req.params.idU)) {
                    const userDeleteIndex = Question.answers[Index].replies[replyIndex].upVotes
                        .map((up => up.user.toString()))
                        .indexOf(req.params.idU);
                    console.log(userDeleteIndex);
                    Question.answers[Index].replies[replyIndex].upVotes.splice(userDeleteIndex, 1);
                }
                console.log('doesnt exist')
                Question.answers[Index].replies[replyIndex].downVotes.push(vote);
            }
            Question.save().then(() => {
                console.log('downVotes Reply');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.post('/:idQ/addView', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            Question.views = Question.views + 1;

            Question.save().then(() => {
                console.log('view added');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })

        }).catch(err => res.status(400).json('error: ' + err));
    }
);
router.get('/sortQuestions/:sort', (req, res) => {
        Question.find().then(Questions => {

            if (req.params.sort === 'views') {
                Questions.sort((a, b) => {
                    return b.views - a.views;
                })
            }
            if (req.params.sort === 'votes') {
                Questions.sort((a, b) => {
                    var UpVotesa = [];
                    for (var i in a.upVotes)
                        UpVotesa.push(a.upVotes[i].user.toString());

                    var DownVotea = [];
                    for (var i in a.downVotes)
                        DownVotea.push(a.downVotes[i].user.toString());

                    var UpVotesb = [];
                    for (var i in b.upVotes)
                        UpVotesb.push(b.upVotes[i].user.toString());

                    var DownVoteb = [];
                    for (var i in b.downVotes)
                        DownVoteb.push(b.downVotes[i].user.toString());

                    return (UpVotesb.length - DownVoteb.length) - (UpVotesa.length - DownVotea.length);
                });

            }
            if (req.params.sort === 'answers') {
                Questions.sort((a, b) => {
                    var answersa = [];
                    for (var i in a.answers)
                        answersa.push(a.answers[i].user.toString());

                    var answersb = [];
                    for (var i in b.answers)
                        answersb.push(b.answers[i].user.toString());

                    return answersb.length - answersa.length;
                });
            }
            if (req.params.sort === 'recent') {
                Questions.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
            }
            res.json(Questions)
        })
            .catch(err => res.status(400).json('error: ' + err));
    }
);

router.get('/filterQuestions/:tag', (req, res) => {
        Question.find().then(Questions => {
            if (req.params.tag === 'html') {
                res.json(Questions.filter(q => q.tags.includes('html')));
            }
            if (req.params.tag === 'css') {
                res.json(Questions.filter(q => q.tags.includes('css')));
            }
            if (req.params.tag === 'javascript') {
                res.json(Questions.filter(q => q.tags.includes('javascript')));
            }
            if (req.params.tag === 'php') {
                res.json(Questions.filter(q => q.tags.includes('php')));
            }
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.get('/searchQuestions/:text', (req, res) => {
        Question.find().then(Questions => {
            res.json(Questions.filter(q => {
                const subject = '' + JSON.stringify(q.subject);
                const describtion = '' + JSON.stringify(q.description);
                return subject.toUpperCase().includes(req.params.text.toUpperCase())
                    || describtion.toUpperCase().includes(req.params.text.toUpperCase());
            }));
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.post('/:idQ/followQuestion/:idU', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const follow = {
                user: req.params.idU,
            }
            Question.following.push(follow);

            Question.save().then(() => {
                Question.find().then(Questions => res.json(Questions))
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);

router.post('/:idQ/unFollowQuestion/:idU', (req, res) => {
    Question.findById(req.params.idQ).then(Question => {

        const followIndex = Question.following
            .map((follow) => follow.user.toString())
            .indexOf(req.params.idA);
        Question.following.splice(followIndex, 1);
        Question.save().then(() => {
            Question.find().then(Questions => res.json(Questions))
        }).catch(err => {
            res.status(400).json('error: ' + err);
        })
    }).catch(err => res.status(400).json('error: ' + err));
});

module.exports = router;
