/* Dependencies */

const express = require('express');

var router = express.Router();
var helper = require('../utils/helper');
var auth = require('../utils/auth');
var admin = require('firebase-admin');

/*
Questions (CRUD)
*/

/**
 * Creates a question for the game
 */
router.post('/create', auth.level1, auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];

    //need a question and answer in string format
    var question = req.body.question;
    var answer = req.body.answer;
    var type = req.body.type; //e (estimathon), s (single answer), m (multiple choice)
    var multiplier = req.body.multiplier; //an array of multiple choice answers
    var choices = req.body.choices; //an array of multiple choice answers
    var imageCode = req.body.image;

    if (
        question === undefined ||
        answer === undefined ||
        type === undefined ||
        multiplier === undefined ||
        choices === undefined ||
        imageCode === undefined
    ) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    var db = admin.database();

    let questionData = {
        q: question,
        a: answer,
        t: type,
        image: imageCode,
    };

    //the answer choice must be less than 50 characters long. This is just to prevent storing
    //too much data in Firebase
    if (String(answer).length >= 50) {
        return res.json({
            success: false,
            message:
                "Please make sure that the answer isn't longer than 50 characters.",
        });
    }

    if (choices.length > 0) {
        //Before we save our question, we must check one thing: The answer choices cannot
        //contain that character "`". The reason why is because this character will be
        //used as a delimiter

        //We also must make sure that

        for (var i = 0; i < choices.length; i++) {
            if (String(choices[i]).indexOf('`') >= 0) {
                return res.json({
                    success: false,
                    message:
                        "Please make sure that the answer/answer choices doesn't contain the character '`'.",
                });
            } else if (String(choices[i]).length >= 50) {
                return res.json({
                    success: false,
                    message:
                        "Please make sure that your answer choices aren't longer than 50 characters.",
                });
            }
        }

        questionData['choices'] = choices;
    }

    if (type != 'e') {
        questionData['multiplier'] = parseInt(multiplier); //convert to int
    }
    //add new question
    db.ref('Games/' + gameCode + '/questions').push(questionData);

    //increments the number of total questions
    db.ref('Games/' + gameCode + '/settings/public/numQuestions').transaction(
        function (current_value) {
            var c = current_value || 0;
            c = parseInt(c);
            return c + 1;
        },
    );

    return res.json({
        success: true,
        message: 'Question has been created.',
    });
});

/**
 * Returns all of the questions belonging to a specific game
 */

router.get('/get', auth.level3, auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];

    var db = admin.database();
    var ref = db.ref('Games/' + gameCode + '/questions');

    ref.once(
        'value',
        async function (snapshot) {
            //only reads once - https://stackoverflow.com/questions/48939104/firebase-warning-cant-set-headers-after-they-are-sent
            var data = snapshot.val();

            //get the game type as well since this will dicate the types of questions
            let gameTypeResponse = await helper.getGameType(gameCode);

            if (!gameTypeResponse.success) {
                return res.json({
                    success: false,
                    message: gameTypeResponse.message,
                });
            }

            if (data != null) {
                //there are questions
                return res.json({
                    success: true,
                    message: 'All questions.',
                    data: data,
                    type: gameTypeResponse.data,
                });
            } else {
                //there are no questions
                return res.json({
                    success: true,
                    message: 'All questions.',
                    data: {}, //returns empty dictionary
                    type: gameTypeResponse.data,
                });
            }
        },
        function (errorObject) {
            console.log('The read failed: ' + errorObject.code);
            return res.json({
                success: false,
                message: errorObject.message,
            });
        },
    );
});

/**
 * Deletes a question based off of its id
 */
router.delete(
    '/delete',
    auth.level1,
    auth.checkGameCode,
    auth.validateBody,
    function (req, res) {
        let gameCode = req.headers['game'];

        var id = req.body.id; //sent an id that is a string

        if (id === undefined) {
            return res.json({
                success: false,
                message: 'Improper request',
            });
        }

        var db = admin.database();
        db.ref('Games/' + gameCode + '/questions/' + id).remove(); //removes from questions section

        //decrements the total number of questions
        db.ref('Games/' + gameCode + '/settings/public/numQuestions')
            .transaction(function (current_value) {
                var c = current_value || 0;
                c = parseInt(c);
                if (c > 0) return current_value - 1; //makes sure that the number of questions isn't negative
                return 0;
            })
            .then(() => {
                return res.json({
                    success: true,
                    message: 'Question has been deleted.',
                });
            });
    },
);

/**
 * Deletes all of the questions
 */
router.delete(
    '/clear',
    auth.level1,
    auth.checkGameCode,
    async function (req, res) {
        let gameCode = req.headers['game'];
        const imagesDeleted = await helper.deleteImages(gameCode);

        if (imagesDeleted) {
            var db = admin.database();
            db.ref('Games/' + gameCode + '/questions').remove(); //removes all of the questions
            db.ref('Games/' + gameCode + '/settings/public/numQuestions').set(
                0,
            ); //0 total questions

            return res.json({
                success: true,
                message: 'All of the questions have been deleted.',
            });
        } else {
            return res.json({
                success: false,
                message:
                    'There was a problem deleting questions. Please refresh the page and try again.',
            });
        }
    },
);

/**
 * Updates the question, question type, answer, and answer choices for a specific question based on its id
 */
router.post('/update', auth.level1, auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];

    //id, question, and answer all in string format
    var id = req.body.id;
    var question = req.body.question;
    var answer = req.body.answer;
    var choices = req.body.choices;
    var multiplier = req.body.multiplier;
    var type = req.body.type; //e (estimathon), s (single answer), m (multiple choice)
    var imageCode = req.body.image;

    if (
        id === undefined ||
        question === undefined ||
        answer === undefined ||
        choices === undefined ||
        multiplier === undefined ||
        type === undefined ||
        imageCode === undefined
    ) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    var db = admin.database();
    var ref = db.ref('Games/' + gameCode + '/questions/' + id);

    //queries the question to make sure that it exists
    ref.once(
        'value',
        function (snapshot) {
            //only reads once
            var data = snapshot.val();

            if (data === null) {
                return res.json({
                    success: false,
                    message: "Question doesn't exist.",
                });
            } else {
                let questionData = {
                    q: question,
                    a: answer,
                    t: type,
                    image: imageCode,
                };

                //the answer choice must be less than 500 characters long. This is just to prevent storing
                //too much data in Firebase. Max permitted is much larger though.
                if (String(answer).length >= 500) {
                    return res.json({
                        success: false,
                        message:
                            "Please make sure that the answer isn't longer than 500 characters.",
                    });
                }

                if (choices.length > 0) {
                    //Before we save our question, we must check one thing: The answer choices cannot
                    //contain that character "`". The reason why is because this character will be
                    //used as a delimiter

                    //We also must make sure that

                    for (var i = 0; i < choices.length; i++) {
                        if (String(choices[i]).indexOf('`') >= 0) {
                            return res.json({
                                success: false,
                                message:
                                    "Please make sure that the answer/answer choices doesn't contain the character '`'.",
                            });
                        } else if (String(choices[i]).length >= 500) {
                            return res.json({
                                success: false,
                                message:
                                    "Please make sure that your answer choices aren't longer than 500 characters.",
                            });
                        }
                    }

                    questionData['choices'] = choices;
                }

                if (type != 'e') {
                    questionData['multiplier'] = parseFloat(multiplier); //convert to int
                }

                //updates the question
                db.ref('Games/' + gameCode + '/questions/' + id).set(
                    questionData,
                );

                return res.json({
                    success: true,
                    message: 'Question has been updated.',
                });
            }
        },
        function (errorObject) {
            console.log('The read failed: ' + errorObject.code);
            return res.json({
                success: false,
                message: errorObject.message,
            });
        },
    );
});

module.exports = router;
