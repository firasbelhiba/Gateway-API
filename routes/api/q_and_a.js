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

//FindQuestionByID
router.get('/:id', (req, res) => {
        Question.findById(req.params.id).then(Question => res.json(Question))
            .catch(err => res.status(400).json('error: ' + err));
    }
);

//DeleteQuestion
router.delete('/delete/:id', (req, res) => {
        Question.findByIdAndDelete(req.params.id).then(() => res.json('Question Deleted'))
            .catch(err => res.status(400).json('error: ' + err));
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
                description: req.body.description,
                date: req.body.date,
            };
            Question.answers.find((answer) => answer.id === req.params.idA).replies.push(newReply);
            Question.save().then(() => {
                res.json(Question);
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
            Question.upVotes.push(vote);

            Question.save().then(() => {
                console.log('voted');
                res.json(Question.upVotes);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);
router.post('/:idQ/cancelUpVote/:idU', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {
            const removeIndex = Question.upVotes
                .map((upVote) => upVote.user.toString())
                .indexOf(req.params.idU);

            Question.upVotes.splice(removeIndex, 1);

            Question.save().then(() => {
                console.log('voted canceled');
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
            Question.downVotes.push(vote);

            Question.save().then(() => {
                console.log('downvoted');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);
router.post('/:idQ/cancelDownVote/:idU', (req, res) => {
        Question.findById(req.params.idQ).then(Question => {

            const removeIndex = Question.downVotes
                .map((downVote) => downVote.user.toString())
                .indexOf(req.params.idU);

            Question.downVotes.splice(removeIndex, 1);

            Question.save().then(() => {
                console.log('downvote canceled');
                res.json(Question);
            }).catch(err => {
                res.status(400).json('error: ' + err);
            })
        }).catch(err => res.status(400).json('error: ' + err));
    }
);


module.exports = router;
