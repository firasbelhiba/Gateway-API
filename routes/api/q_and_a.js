const express = require('express');
const router = express.Router();
const User = require("../../models/User");
const Question = require("../../models/Question");
const Answer = require("../../models/Answer");
const Reply = require("../../models/Reply");

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
            res.send('Question added');
        }).catch(err => {
            res.status(400).json('error:' + err);
        });
    }
)

module.exports = router;
