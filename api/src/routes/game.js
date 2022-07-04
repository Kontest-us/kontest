/* Dependencies */

const express = require('express');
var router = express.Router();
var helper = require('../utils/helper');
var auth = require('../utils/auth');
var admin = require('firebase-admin');
const asciimath2latex = require('asciimath-to-latex');
var Storage = require('../utils/storage');

/*
Game Settings
*/

router.post('/getAdminStatus', auth.level3, function (req, res) {
    return res.json({
        success: true,
        message: 'Here is your status',
        data: req.status,
    });
});

//Returns a random game code to the admin
router.get('/randomCode', auth.getToken, async function (req, res) {
    var randomUID = helper.randomUID(4); //default length will be 4

    //make sure that this uid doesn't exist already in firebase

    var response = await helper.checkIfGameExists(randomUID);

    while (response.exists) {
        randomUID = helper.randomUID(4); //default length will be 4
        response = await helper.checkIfGameExists(randomUID);
    }

    res.json({
        success: true,
        code: randomUID,
    });
});

//Creates a game
router.post(
    '/createGame',
    auth.getToken,
    auth.validateBody,
    async function (req, res) {
        var body = req.body;

        var db = admin.database();

        settings = {
            studentFreedom: body.studentFreedom, //1 -> can't do anything, 2 - > can join and leave teams, 3 -> join, create, and leave teams
            end: body.end,
            guesses: parseInt(body.guesses),
            // "showAnswers": false, // automatically not show answers
            maxPerTeam: body.maxPerTeam,
            name: body.name,
            numQuestions: 0,
            numTeams: 0,
            start: body.start,
            scoreVisibility: { all: true, num: parseInt(body.scoreVisibility) }, // automatically all scores are visible
            live: false, //game is automatically not live
            type: body.type, //1 - estimathon, 2 - review,
            public: false,
        };

        var clientOffset = body.offset;

        settings.start = helper.timeToServer(
            clientOffset,
            settings.start,
            false,
        );
        settings.end = helper.timeToServer(clientOffset, settings.end, false);

        // set if

        //make sure that each setting isn't undefined

        let allKeys = Object.keys(settings);

        var key;

        for (key of allKeys) {
            if (settings[key] === undefined) {
                return res.json({
                    success: false,
                    message: 'Improper request',
                });
            }
        }

        //name must be entered for the game

        if (settings['name'] === '') {
            return res.json({
                success: false,
                message: 'Please enter a name for your game.',
            });
        }

        var gameCode = req.headers.game;
        var uid = req.uid;

        if (gameCode === undefined || typeof gameCode != 'string') {
            return res.json({
                success: false,
                message: 'Improper request',
            });
        }

        //game code with a max of 4 characters
        if (gameCode.length > 4) {
            return res.json({
                success: false,
                message:
                    'Please enter a game code with a maximum of 4 characters.',
            });
        }

        //check to make sure that this code doesn't already exist

        var response = await helper.checkIfGameExists(gameCode);

        if (response.exists) {
            return res.json({
                success: false,
                message:
                    'A game with the same game code has already been created. Please choose another game code.',
            });
        } else {
            //we can create the game now

            var game = {
                settings: {
                    private: {
                        studentFreedom: settings.studentFreedom,
                        live: settings.live,
                        public: settings.public,
                    },
                    public: {
                        end: settings.end,
                        guesses: settings.guesses,
                        maxPerTeam: settings.maxPerTeam,
                        name: settings.name,
                        numQuestions: settings.numQuestions,
                        numTeams: settings.numTeams,
                        start: settings.start,
                        scoreVisibility: settings.scoreVisibility,
                        type: settings.type,
                    },
                },
            };

            //add game
            db.ref('Games/' + gameCode).set(game);

            //get the admin's name and add them to this game

            admin
                .auth()
                .getUser(uid)
                .then((userRecord) => {
                    // See the UserRecord reference doc for the contents of userRecord.
                    userRecord = userRecord.toJSON();
                    let displayName = userRecord.displayName;
                    let email = userRecord.email;

                    //add admin uid to game
                    db.ref('Games/' + gameCode + '/admins/' + uid).set({
                        name: displayName,
                        email: email,
                        status: 0, //head status
                    });

                    //set admin as the game's head
                    db.ref('Games/' + gameCode + '/admins/head').set(uid);

                    //do the rest
                    //add game to second spot
                    db.ref('TotalGames/' + gameCode).set(settings.name);

                    //third spot: adds game underneath admin
                    db.ref('Admins/' + uid + '/games/' + gameCode).set(true);

                    //Don't need to add to a fourth spot for Public Games since the game being created
                    //is automatically not public

                    return res.json({
                        success: true,
                        message: 'Game has been created!',
                    });
                });
        }
    },
);

/**
 * Returns all of the games that an admin is a part of
 */

router.get('/getAllGames', auth.getToken, function (req, res) {
    var db = admin.database();
    var uid = req.uid;
    var ref = db.ref('Admins/' + uid + '/games');

    //gets all of the teams that the admin is a part of
    ref.once(
        'value',
        async function (snapshot) {
            //only reads once
            var games = snapshot.val();
            var gamesArr = [];
            if (games != null) {
                for (var key of Object.keys(games)) {
                    //get each game's code
                    var gameCode = key;
                    var gameResponse = await helper.checkIfGameExists(gameCode); //get the game's name and type, and check if the game exists
                    //game doesn't exist
                    if (!gameResponse.exists) {
                        continue;
                    }
                    var isLive = await helper.checkGameIsLive(gameCode); //check if the game is live
                    var gameType = await helper.getGameType(gameCode);
                    gameType = gameType.success ? gameType.data : '1';

                    //add to array
                    gamesArr.push({
                        gameCode: gameCode,
                        gameName: gameResponse.gameName,
                        live: isLive,
                        gameType: gameType,
                    });
                }
            }

            return res.json({
                success: true,
                games: gamesArr, //returns games in array format (can be empty if admin hasn't created any games)
                message: 'Here are the games!',
            });
        },
        function (errorObject) {
            console.log('The read failed: ' + errorObject.code);
            return res.json({
                success: false,
                message: 'Error, please try again!',
            });
        },
    );
});

/**
 * Returns all of the public games
 */

router.post('/getAllPublicGames', auth.getToken, function (req, res) {
    var db = admin.database();
    var ref;

    let lastGameCode = req.body.lastGameCode || '';

    let numGamesLoaded = 15;

    //Source: https://hackernoon.com/infinite-scrolling-in-firebase-e28bfbc53578
    if (lastGameCode === '') {
        //first search
        ref = db.ref('Public').orderByKey().limitToLast(numGamesLoaded);
    } else {
        //scrolled down
        ref = db
            .ref('Public')
            .orderByKey()
            .endAt(lastGameCode)
            .limitToLast(numGamesLoaded + 1);
    }

    //gets all of the teams that the admin is a part of
    ref.once(
        'value',
        async function (snapshot) {
            //only reads once
            var games = snapshot.val();

            var gamesArr = [];
            if (games != null) {
                let arrayOfKeys = Object.keys(games).sort().reverse();

                if (lastGameCode !== '') {
                    //Since we did endAt (inclusive) on the firebase ref, we got a duplicate object. We need to get rid of this
                    arrayOfKeys = arrayOfKeys.slice(1);
                }

                var referenceToOldestKey = arrayOfKeys[arrayOfKeys.length - 1];

                for (var key of arrayOfKeys) {
                    //get each game's code
                    var gameCode = key;

                    var gameResponse = await helper.checkIfGameExists(gameCode); //get the game's name and type, and check if the game exists
                    //game doesn't exist
                    if (!gameResponse.exists) {
                        continue;
                    }

                    var isLive = await helper.checkGameIsLive(gameCode); //check if the game is live
                    var gameType = await helper.getGameType(gameCode);
                    gameType = gameType.success ? gameType.data : '1';

                    //add to array
                    gamesArr.push({
                        gameCode: gameCode,
                        gameName: gameResponse.gameName,
                        live: isLive,
                        gameType: gameType,
                    });
                }
            }

            return res.json({
                success: true,
                games: gamesArr, //returns games in array format (can be empty if admin hasn't created any games)
                message: 'Here are the games!',
                lastGameCode: referenceToOldestKey,
            });
        },
        function (errorObject) {
            console.log('The read failed: ' + errorObject.code);
            return res.json({
                success: false,
                message: 'Error, please try again!',
            });
        },
    );
});

// function updateGame(gameCode) {
//   return new Promise(resolve => { //asynchronous method
//     var db = admin.database();
//     var ref = db.ref("Games/" + gameCode + "/admins");
//     ref.once("value", async function(snapshot) { //only reads once
//       var allAdmins = snapshot.val();
//       let head = allAdmins["head"];

//       for (var admin of Object.keys(allAdmins))
//       {
//         if(admin === "head") {
//           continue;
//         }
//         if(head === admin) {
//           //give status 0
//           db.ref("Games/" + gameCode + "/admins/" + admin + "/status").set(0);
//         } else {
//           //give status 1
//           db.ref("Games/" + gameCode + "/admins/" + admin + "/status").set(1);
//         }
//       }

//       resolve(true);

//     }, function (errorObject) {
//       console.log("The read failed: " + errorObject.code);
//       resolve(false);
//     });

//   })
// }

// router.post("/updateAdminLevels", function(req, res) {

//   //first, get all of the games
//   var db = admin.database();

//   var ref = db.ref("TotalGames");

//   //gets all of the teams that the admin is a part of
//   ref.once("value", async function(snapshot) { //only reads once
//     var allGames = snapshot.val();

//     for (var game of Object.keys(allGames))
//     {
//       console.log(game)
//       //now that we have the game, we must update each of its admins
//       updateGame(game);
//     }

//     return res.json({
//       success: true,
//       message: "Great success."
//     })

//   }, function (errorObject) {
//     console.log("The read failed: " + errorObject.code);
//     return res.json({
//       success: false,
//       message: "Error, please try again!"
//     })
//   });

// })

/**
 * Add an admin to a game
 */

router.post(
    '/addAdminToGame',
    auth.level0,
    auth.checkGameCode,
    function (req, res) {
        //now that we have confirmed that this game belongs to this admin, we can add this admin
        var db = admin.database();
        let adminEmail = req.body.adminEmail;
        let gameCode = req.headers.game;
        let status = parseInt(req.body.status);

        admin
            .auth()
            .getUserByEmail(adminEmail)
            .then((userRecord) => {
                // See the UserRecord reference doc for the contents of userRecord.

                userRecord = userRecord.toJSON();
                let uid = userRecord.uid;
                let displayName = userRecord.displayName;

                //add admin uid to game
                db.ref('Games/' + gameCode + '/admins/' + uid).set({
                    email: adminEmail,
                    name: displayName,
                    status: status,
                });

                //add game to admin
                db.ref('Admins/' + uid + '/games/' + gameCode).set(true);

                res.json({
                    success: true,
                    message: 'This admin has been added to the game.',
                });
            })
            .catch((error) => {
                console.log('Error fetching user data:', error);
                res.json({
                    success: false,
                    message:
                        "This email doesn't exist. Please tell the teacher that you are adding to register an account on this site. Afterwards, you will be able to add them.",
                });
            });
    },
);

router.post(
    '/makeGameLive',
    auth.level1,
    auth.checkGameCode,
    auth.validateBody,
    function (req, res) {
        let gameCode = req.headers.game;
        var db = admin.database();

        let isLive = req.body.live;

        if (isLive === undefined) {
            return res.json({
                success: false,
                message: 'Please enter if the game is live or not',
            });
        }

        //updates private settings
        db.ref('Games/' + gameCode + '/settings/private/live').set(isLive);

        return res.json({
            success: true,
            message: 'Updated game live',
        });
    },
);

/**
 * Updates settings for a specific game
 */

router.post(
    '/updateSettings',
    auth.level1,
    auth.checkGameCode,
    auth.validateBody,
    function (req, res) {
        let gameCode = req.headers.game;

        //all of the game's public and private settings
        var numQuestions = req.body.numQuestions;
        var end = req.body.end;
        var start = req.body.start;
        var numTeams = req.body.numTeams;
        var name = req.body.gameName;
        var studentFreedom = req.body.studentFreedom;
        var maxPerTeam = req.body.maxPerTeam;
        var live = req.body.live;
        var scoreVisibility = req.body.scoreVisibility;
        var guesses = req.body.guesses;
        var public = req.body.public;

        if (
            numQuestions === undefined ||
            end === undefined ||
            start === undefined ||
            guesses === undefined ||
            numTeams === undefined ||
            name === undefined ||
            studentFreedom === undefined ||
            maxPerTeam === undefined ||
            live === undefined ||
            scoreVisibility === undefined ||
            public === undefined
        ) {
            return res.json({
                success: false,
                message: 'Improper request',
            });
        }

        var clientOffset = req.body.offset;

        end = helper.timeToServer(clientOffset, end, false);
        start = helper.timeToServer(clientOffset, start, false);

        var db = admin.database();
        var ref = db.ref('Games/' + gameCode + '/settings/public');

        ref.once(
            'value',
            function (snapshot) {
                //only reads once - https://stackoverflow.com/questions/48939104/firebase-warning-cant-set-headers-after-they-are-sent
                var data = snapshot.val();
                var maxNum = parseInt(data.numTeams);

                if (parseInt(scoreVisibility['num']) > maxNum) {
                    return res.json({
                        success: false,
                        message:
                            'You cannot show that number of teams that you have inputted. Please enter a valid number.',
                        data: data,
                    });
                } else {
                    //updates private settings
                    db.ref('Games/' + gameCode + '/settings/private').update({
                        studentFreedom: studentFreedom,
                        live: live,
                        public: public,
                    });

                    //updates public settings
                    db.ref('Games/' + gameCode + '/settings/public').update({
                        numQuestions: parseInt(numQuestions),
                        guesses: guesses,
                        end: end,
                        start: start,
                        numTeams: parseInt(numTeams),
                        name: name,
                        maxPerTeam: parseInt(maxPerTeam),
                        scoreVisibility: scoreVisibility,
                    });

                    //update name in TotalGames
                    db.ref('TotalGames/' + gameCode).set(name);

                    //Update Public
                    if (public) {
                        db.ref('Public/' + gameCode).set('');
                    } else {
                        db.ref('Public/' + gameCode).remove();
                    }

                    return res.json({
                        success: true,
                        message: 'Settings have been updated.',
                    });
                }
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                return res.json({
                    success: false,
                    message: 'Error.',
                });
            },
        );
    },
);

/*
Delete's a game
*/

router.delete(
    '/deleteGame',
    auth.level0,
    auth.checkGameCode,
    async function (req, res) {
        var gameCode = req.headers['game'];

        var response = await helper.deleteGame(gameCode); //deletes the game

        res.json({
            success: response.success,
            message: response.message,
        });
    },
);

//Duplicates a game
router.post(
    '/duplicateGame',
    auth.level3,
    auth.checkGameCode,
    async function (req, res) {
        var gameCode = req.headers['game'];

        //Get the settings for the game
        let settings = await helper.getFullGameSettings(gameCode);

        //update the settings for the new game
        settings.public.numTeams = 0;
        settings.private.live = false;
        settings.public.name = 'Copy of ' + settings.public.name;
        settings.public.scoreVisibility.num = 0;
        settings.private.public = false;

        //get the admins for the game
        let admins = await helper.getGameAdmins(gameCode);

        let foundAdmin = false;

        let uid = req.uid; //the admins firebase uid

        //remove all admins except the teacher duplicating the game
        for (var key of Object.keys(admins)) {
            if (key === 'head') {
                admins[key] = uid;
            } else if (key !== uid) {
                delete admins[key];
            } else {
                admins[key]['status'] = 0; //give admin status
                foundAdmin = true;
            }
        }

        //Handle the case where this game is public and the person being added wasn't an admin before
        if (!foundAdmin) {
            let getAdminRecord = () => {
                return new Promise((resolve) => {
                    //asynchronous method
                    admin
                        .auth()
                        .getUser(uid)
                        .then((userRecord) => {
                            // See the UserRecord reference doc for the contents of userRecord.
                            userRecord = userRecord.toJSON();
                            let displayName = userRecord.displayName;
                            let email = userRecord.email;

                            resolve({
                                name: displayName,
                                email: email,
                            });
                        });
                });
            };

            //Add admin to the
            let adminData = await getAdminRecord();
            admins[req.uid] = {
                email: adminData.email,
                name: adminData.name,
                status: 0,
            };
        }

        //get a new game code
        var newGameCode = helper.randomUID(4); //default length will be 4

        //make sure that this uid doesn't exist already in firebase

        var response = await helper.checkIfGameExists(newGameCode);

        while (response.exists) {
            newGameCode = helper.randomUID(4); //default length will be 4
            response = await helper.checkIfGameExists(newGameCode);
        }

        //Get the questions for the game.

        let questions = await helper.getGameQuestions(gameCode);

        let imageStorage = new Storage();

        //copys images from the original game folder to the new game folder
        await imageStorage.copyFilesInFolder(
            'questions/' + gameCode,
            'questions/' + newGameCode,
        );

        //Update firebase

        //create new game
        var db = admin.database();
        db.ref('Games/' + newGameCode).set({
            admins: admins,
            settings: settings,
            questions: questions,
        });

        //second spot to preserve lookup time
        db.ref('TotalGames/' + newGameCode).set(settings.public.name);

        //add game to admin record
        db.ref('Admins/' + req.uid + '/games/' + newGameCode).set(true);

        return res.json({
            success: true,
            message: 'The game has been duplicated!',
            data: { newGameCode: newGameCode },
        });
    },
);

/**
 * Returns the public and private settings
 */

router.post(
    '/getSettings',
    auth.level3,
    auth.checkGameCode,
    function (req, res) {
        let gameCode = req.headers['game'];

        let includeSeconds = req.body.includeSeconds;

        var db = admin.database();
        var ref = db.ref('Games/' + gameCode + '/settings');

        ref.once(
            'value',
            function (snapshot) {
                //only reads once - https://stackoverflow.com/questions/48939104/firebase-warning-cant-set-headers-after-they-are-sent
                var data = snapshot.val();

                var localOffset = helper.getOffset(includeSeconds);

                return res.json({
                    success: true,
                    message: 'Settings.',
                    data: data,
                    offset: localOffset,
                });
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                return res.json({
                    success: false,
                    message: 'Error.',
                });
            },
        );
    },
);

/*
Public (Student) Functionalities
*/

/**
 * Returns all of the scores for every team
 */
router.get(
    '/getTable',
    auth.checkGameCode,
    auth.validateBody,
    function (req, res) {
        let gameCode = req.headers['game'];

        var db = admin.database();
        var ref = db.ref('Games/' + gameCode + '/settings/public/numQuestions');

        ref.once(
            'value',
            function (snapshot) {
                //first, get the number of questions
                var numQuestions = snapshot.val();
                numQuestions = parseInt(numQuestions);

                //change reference because we need more stuff from db
                ref = db.ref('Games/' + gameCode + '/teams');

                //now, we get each team's scores
                ref.once('value', async function (snapshot) {
                    var data = snapshot.val();

                    let questionData = await helper.getQuestionMult(gameCode);

                    var table = helper.getTable(
                        questionData,
                        numQuestions,
                        data,
                    );

                    res.json({
                        success: true,
                        data: table,
                    });
                });
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                return res.json({
                    success: false,
                    message: 'Error, please try again!',
                });
            },
        );
    },
);

/**
 * Team submits an answer
 */

/**
 * 1. Restrict all numbers to 10 characters
 * 2. Make sure that students/teachers know about answering questions in the format 2e9
 * 3. Store all numbers as strings in firebase
 * 4. Checking if good number:
 *   If saved has e: convert bounds to e format -  a.toExponential();
 *   Check if lower exp <= ans exp <= upper exp
 *   Check if lower num <= ans num <= upper num
 * 5. For points, if upper / lower > 1000, then don't give them points and don't count that as a guess
 * 6. Otherwise, do upper num / lower num * 10^(upper exp / lower exp)
 */

router.post('/submitAnswer', auth.checkGameCode, async function (req, res) {
    let gameCode = req.headers['game'];

    //get data
    var questionId = req.body.questionId; //uid of question
    var questionOrder = req.body.questionOrder; //0, 1, 2, 3, ...
    var studentAnswer = req.body.studentAnswer;
    var teamName = req.body.teamName;
    var studentName = req.body.studentName;

    if (
        questionId === undefined ||
        questionOrder === undefined ||
        studentAnswer === undefined ||
        teamName === undefined ||
        studentName === undefined
    ) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    //get game settings
    var gameSettings = await helper.getGameSettings(gameCode);
    gameSettings = gameSettings.data;

    //first, check if the game is going on

    var timeResponse = helper.goodTime(gameSettings);

    if (!timeResponse.success) {
        return res.json({
            success: false,
            message: timeResponse.message,
        });
    }

    //next, check if team has guesses left

    var db = admin.database();

    var ref = db.ref(
        'Games/' + gameCode + '/teams/' + teamName + '/totalGuesses',
    );

    ref.once(
        'value',
        async function (snapshot) {
            //only reads once
            var totalGuesses = snapshot.val();

            //team doesn't exist
            if (totalGuesses === null) {
                return res.json({
                    success: false,
                    message: "This team doesn't exist!",
                });
            }

            totalGuesses = parseInt(totalGuesses);

            var canGuess = helper.remainingGuesses(totalGuesses, gameSettings);
            if (!canGuess) {
                //the team ran out of guesses
                return res.json({
                    success: false,
                    message: 'You have used up all of your guesses!',
                });
            }

            //now we check if the student belongs to the team
            ref = db.ref(
                'Games/' + gameCode + '/teams/' + teamName + '/allStudents',
            );

            ref.once('value', async function (snapshot) {
                var allStudents = snapshot.val();

                var foundName = false; //assume that the student hasn't been found
                for (var key of Object.keys(allStudents)) {
                    if (allStudents[key]['name'] === studentName) {
                        foundName = true;
                        break;
                    }
                }

                //student has never been found
                if (!foundName) {
                    return res.json({
                        success: false,
                        message: "Student doesn't belong to the team.",
                    });
                } else {
                    //good user
                    //next, check answer against correct answer

                    var db = admin.database();
                    var ref = db.ref(
                        'Games/' + gameCode + '/questions/' + questionId,
                    );

                    //queries the actual answer to the question based on the questionID
                    ref.once(
                        'value',
                        async function (snapshot) {
                            //only reads once
                            var questionData = snapshot.val();

                            let goodAnswer = questionData.a;
                            let multiplier = questionData.multiplier || 0;
                            let choices = questionData.choices || [];

                            if (goodAnswer) {
                                /*
                        Now we check the student answer against the teacher answer
                        If it is an estimathon, we check the bounds
                        If it is a multiple choice, we check answer
                        */
                                if (questionData.t === 'e') {
                                    var lowerBound = studentAnswer.lowerBound;
                                    var upperBound = studentAnswer.upperBound;

                                    try {
                                        //try/catch in case a bad number is passed in

                                        if (
                                            String(lowerBound).length > 12 ||
                                            String(upperBound).length > 12
                                        ) {
                                            return res.json({
                                                success: false,
                                                message:
                                                    'Your bounds are too large. Please enter the number using e notation (ex: 2e3 for 2000)',
                                            });
                                        }

                                        //checks if the lower and upper bounds are numbers
                                        if (
                                            isNaN(lowerBound) ||
                                            isNaN(upperBound)
                                        ) {
                                            return res.json({
                                                success: false,
                                                message:
                                                    'Your bounds are not numbers!',
                                            });
                                        }

                                        goodAnswer = String(goodAnswer);
                                        lowerBound = String(lowerBound);
                                        upperBound = String(upperBound);

                                        //continues to make sure that the bounds are good
                                        if (
                                            helper.compareNumbers(
                                                lowerBound,
                                                upperBound,
                                            )
                                        ) {
                                            return res.json({
                                                success: false,
                                                message:
                                                    'Your lower bound is greater than or equal to to your upper bound',
                                            });
                                        } else if (
                                            String(upperBound).substring(
                                                0,
                                                1,
                                            ) === '-' ||
                                            String(lowerBound).substring(
                                                0,
                                                1,
                                            ) === '-'
                                        ) {
                                            return res.json({
                                                success: false,
                                                message:
                                                    'Your bounds cannot be less than or equal to 0',
                                            });
                                        } else if (
                                            helper.checkZero(upperBound) ||
                                            helper.checkZero(lowerBound)
                                        ) {
                                            return res.json({
                                                success: false,
                                                message:
                                                    'Your bounds cannot be less than or equal to 0',
                                            });
                                        }

                                        //compares the answer against the upper and lower bound
                                        if (
                                            helper.compareNumbers(
                                                goodAnswer,
                                                lowerBound,
                                            ) &&
                                            helper.compareNumbers(
                                                upperBound,
                                                goodAnswer,
                                            )
                                        ) {
                                            //good answer

                                            var points = helper.divideNumbers(
                                                upperBound,
                                                lowerBound,
                                            );

                                            if (points === 0) {
                                                return res.json({
                                                    success: false,
                                                    message:
                                                        'The difference between your bounds is too big! Try decreasing this value.',
                                                });
                                            }

                                            //give points
                                            db.ref(
                                                'Games/' +
                                                gameCode +
                                                '/teams/' +
                                                teamName +
                                                '/points/' +
                                                questionOrder,
                                            ).set(points);

                                            //increment guesses
                                            db.ref(
                                                'Games/' +
                                                gameCode +
                                                '/teams/' +
                                                teamName +
                                                '/totalGuesses',
                                            ).set(totalGuesses + 1);

                                            //add answer to firebase
                                            db.ref(
                                                'Games/' +
                                                gameCode +
                                                '/teams/' +
                                                teamName +
                                                '/ans/' +
                                                questionOrder,
                                            ).set(
                                                lowerBound + ',' + upperBound,
                                            );

                                            //increments the number of guesses for that question
                                            let guessWorked =
                                                await helper.incrementQuestionGuesses(
                                                    gameCode,
                                                    teamName,
                                                    questionOrder,
                                                );

                                            return res.json({
                                                success: true,
                                                message:
                                                    'Your bounds were right! You have scored ' +
                                                    points +
                                                    ' for question ' +
                                                    (questionOrder + 1) +
                                                    '.',
                                                isCorrect: true,
                                            });
                                        } else {
                                            //bad answer

                                            let val =
                                                await helper.updateBadGuess(
                                                    gameCode,
                                                    teamName,
                                                    questionOrder,
                                                );

                                            //increment guesses
                                            db.ref(
                                                'Games/' +
                                                gameCode +
                                                '/teams/' +
                                                teamName +
                                                '/totalGuesses',
                                            ).set(totalGuesses + 1);

                                            //add answer to firebase
                                            db.ref(
                                                'Games/' +
                                                gameCode +
                                                '/teams/' +
                                                teamName +
                                                '/ans/' +
                                                questionOrder,
                                            ).set(
                                                lowerBound + ',' + upperBound,
                                            );

                                            let guessWorked =
                                                await helper.incrementQuestionGuesses(
                                                    gameCode,
                                                    teamName,
                                                    questionOrder,
                                                );

                                            return res.json({
                                                success: true,
                                                message:
                                                    'Your bounds were wrong! You now have ' +
                                                    val +
                                                    ' for question ' +
                                                    (questionOrder + 1) +
                                                    '.',
                                                isCorrect: false,
                                            });
                                        }
                                    } catch (err) {
                                        console.log('parsing error');
                                        console.log(err.message);
                                        return res.json({
                                            success: false,
                                            message:
                                                'Improper bounds. Please try again.',
                                        });
                                    }
                                } else if (questionData.t === 'm') {
                                    //multiple choice question, check if this team has already answered TOO MANY TIMES
                                    var ref = db.ref(
                                        'Games/' +
                                        gameCode +
                                        '/teams/' +
                                        teamName +
                                        '/guess/' +
                                        questionOrder,
                                    );

                                    //queries the number of guesses this team has for the question based on the questionID
                                    ref.once(
                                        'value',
                                        async function (snapshot) {
                                            //only reads once
                                            let timesGuessed =
                                                snapshot.val() || 0;

                                            //if a team has guessed 3 times and there are 4 answer choices left, then they should
                                            //not be allowed to guess anymore

                                            if (
                                                timesGuessed >=
                                                choices.length - 1
                                            ) {
                                                return res.json({
                                                    success: false,
                                                    message:
                                                        'You have guessed too many times for this multiple choice question.',
                                                });
                                            } else {
                                                //One last check - check if this question is already correct

                                                let hasGoodAnswer =
                                                    await helper.checkGoodAnswer(
                                                        gameCode,
                                                        teamName,
                                                        questionOrder,
                                                    );

                                                if (hasGoodAnswer) {
                                                    return res.json({
                                                        success: false,
                                                        message:
                                                            'You already answered this question correctly.',
                                                    });
                                                }

                                                var studentMultAnswer =
                                                    studentAnswer.answer;

                                                if (
                                                    goodAnswer ===
                                                    studentMultAnswer
                                                ) {
                                                    //correct answer

                                                    //IMPORTANT: Since this is multiple choice, students can answer more than once.
                                                    //However, they don't get full points if they have answered more than once.
                                                    //The way to determine the points is to use the formula below.
                                                    //Basically, if there are 4 answer choices and you get it right after 1 guesses,
                                                    //then you will get half of the points.
                                                    //2 guesses and you get a quarter of the points.

                                                    let points =
                                                        1 /
                                                        Math.pow(
                                                            2,
                                                            timesGuessed,
                                                        );

                                                    points =
                                                        Math.round(
                                                            points * 100,
                                                        ) / 100;

                                                    db.ref(
                                                        'Games/' +
                                                        gameCode +
                                                        '/teams/' +
                                                        teamName +
                                                        '/points/' +
                                                        questionOrder,
                                                    ).set(points);

                                                    //increment guesses
                                                    db.ref(
                                                        'Games/' +
                                                        gameCode +
                                                        '/teams/' +
                                                        teamName +
                                                        '/totalGuesses',
                                                    ).set(totalGuesses + 1);

                                                    let recordAnswer =
                                                        await helper.addMultGuessAnswer(
                                                            gameCode,
                                                            teamName,
                                                            questionOrder,
                                                            studentMultAnswer,
                                                        );

                                                    let guessWorked =
                                                        await helper.incrementQuestionGuesses(
                                                            gameCode,
                                                            teamName,
                                                            questionOrder,
                                                        );

                                                    let multipledScore =
                                                        multiplier * points;

                                                    if (multipledScore > 1) {
                                                        multipledScore =
                                                            Math.round(
                                                                multipledScore,
                                                            );
                                                    } else {
                                                        multipledScore =
                                                            Math.round(
                                                                multipledScore *
                                                                100,
                                                            ) / 100;
                                                    }

                                                    let returnMessage =
                                                        'Your answer is right! You have scored ' +
                                                        multipledScore +
                                                        ' points for question ' +
                                                        (questionOrder + 1) +
                                                        '.';

                                                    if (
                                                        multiplier * points ===
                                                        1
                                                    ) {
                                                        returnMessage =
                                                            'Your answer is right! You have scored 1 point for question ' +
                                                            (questionOrder +
                                                                1) +
                                                            '.';
                                                    }

                                                    return res.json({
                                                        success: true,
                                                        message: returnMessage,
                                                        isCorrect: true,
                                                    });
                                                } else {
                                                    let val =
                                                        await helper.updateBadGuess(
                                                            gameCode,
                                                            teamName,
                                                            questionOrder,
                                                        );

                                                    //increment guesses
                                                    db.ref(
                                                        'Games/' +
                                                        gameCode +
                                                        '/teams/' +
                                                        teamName +
                                                        '/totalGuesses',
                                                    ).set(totalGuesses + 1);

                                                    let recordAnswer =
                                                        await helper.addMultGuessAnswer(
                                                            gameCode,
                                                            teamName,
                                                            questionOrder,
                                                            studentMultAnswer,
                                                        );

                                                    let guessWorked =
                                                        await helper.incrementQuestionGuesses(
                                                            gameCode,
                                                            teamName,
                                                            questionOrder,
                                                        );

                                                    return res.json({
                                                        success: true,
                                                        message:
                                                            'Your answer is wrong! You now have ' +
                                                            val +
                                                            ' for question ' +
                                                            (questionOrder +
                                                                1) +
                                                            '.',
                                                        isCorrect: false,
                                                    });
                                                }
                                            }
                                        },
                                    );
                                } else if (questionData.t === 's') {
                                    var studentSingleAnswer =
                                        studentAnswer.answer;

                                    //since this is a single answer, we must check for numerical value and not if the two strings match

                                    if (
                                        helper.compareTextValues(
                                            goodAnswer,
                                            studentSingleAnswer,
                                        ) ||
                                        helper.compareMathValues(
                                            goodAnswer,
                                            studentSingleAnswer,
                                        )
                                    ) {
                                        //correct answer

                                        //give points
                                        db.ref(
                                            'Games/' +
                                            gameCode +
                                            '/teams/' +
                                            teamName +
                                            '/points/' +
                                            questionOrder,
                                        ).set(1);

                                        //increment guesses
                                        db.ref(
                                            'Games/' +
                                            gameCode +
                                            '/teams/' +
                                            teamName +
                                            '/totalGuesses',
                                        ).set(totalGuesses + 1);

                                        //add answer to firebase
                                        db.ref(
                                            'Games/' +
                                            gameCode +
                                            '/teams/' +
                                            teamName +
                                            '/ans/' +
                                            questionOrder,
                                        ).set(studentSingleAnswer);

                                        let guessWorked =
                                            await helper.incrementQuestionGuesses(
                                                gameCode,
                                                teamName,
                                                questionOrder,
                                            );

                                        let returnMessage =
                                            'Your answer is right! You have scored ' +
                                            multiplier +
                                            ' points for question ' +
                                            (questionOrder + 1) +
                                            '.';

                                        if (multiplier === 1) {
                                            returnMessage =
                                                'Your answer is right! You have scored ' +
                                                multiplier +
                                                ' point for question ' +
                                                (questionOrder + 1) +
                                                '.';
                                        }

                                        return res.json({
                                            success: true,
                                            message: returnMessage,
                                            isCorrect: true,
                                        });
                                    } else {
                                        let val = await helper.updateBadGuess(
                                            gameCode,
                                            teamName,
                                            questionOrder,
                                        );

                                        //increment guesses
                                        db.ref(
                                            'Games/' +
                                            gameCode +
                                            '/teams/' +
                                            teamName +
                                            '/totalGuesses',
                                        ).set(totalGuesses + 1);

                                        //add answer to firebase
                                        db.ref(
                                            'Games/' +
                                            gameCode +
                                            '/teams/' +
                                            teamName +
                                            '/ans/' +
                                            questionOrder,
                                        ).set(studentSingleAnswer);

                                        let guessWorked =
                                            await helper.incrementQuestionGuesses(
                                                gameCode,
                                                teamName,
                                                questionOrder,
                                            );

                                        return res.json({
                                            success: true,
                                            message:
                                                'Your answer is wrong! You now have ' +
                                                val +
                                                ' for question ' +
                                                (questionOrder + 1) +
                                                '.',
                                            isCorrect: false,
                                        });
                                    }
                                }
                            } else {
                                return res.json({
                                    success: false,
                                    message: "Question doesn't exist.",
                                });
                            }
                        },
                        function (errorObject) {
                            console.log('The read failed: ' + errorObject.code);
                            return res.json({
                                success: false,
                                message: "Question doesn't exist.",
                            });
                        },
                    );
                }
            });
        },
        function (errorObject) {
            console.log('The read failed: ' + errorObject.code);
            return res.json({
                success: false,
                message: "Team doesn't exist; please reenter the team name.",
            });
        },
    );
});

//Returns a previous answer that a team got for an answer

router.post('/getPreviousAnswer', auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];
    let studentTeam = req.body.studentTeam;
    let studentName = req.body.studentName;
    let questionNum = req.body.questionNum;

    if (
        studentTeam === undefined ||
        studentName === undefined ||
        questionNum === undefined
    ) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    //first, make sure that the student belongs to the team
    var db = admin.database();
    var ref = db.ref('Games/' + gameCode + '/students/' + studentName);

    ref.once(
        'value',
        function (snapshot) {
            var studentData = snapshot.val();
            if (studentData) {
                if (studentData['team'] === studentTeam) {
                    //now that we have confirmed this student, we can get the previous answer

                    var ref = db.ref(
                        'Games/' +
                        gameCode +
                        '/teams/' +
                        studentTeam +
                        '/ans/' +
                        (questionNum - 1),
                    );
                    ref.once(
                        'value',
                        function (snapshot) {
                            var answer = snapshot.val(); //may be null if the team doesn't have an answer for this question
                            if (answer) {
                                return res.json({
                                    success: true,
                                    data: answer,
                                    message: 'Got the previous answer',
                                });
                            } else {
                                return res.json({
                                    success: true,
                                    data: '"No Answer"',
                                    message: 'Got the previous answer',
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
                } else {
                    return res.json({
                        success: false,
                        message: 'You do not belong to this team!',
                    });
                }
            } else {
                return res.json({
                    success: false,
                    message: 'You are not a part of this game!',
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
 * Returns the questions and time left
 */
router.get('/getGameData', auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];

    var db = admin.database();
    var ref = db.ref('Games/' + gameCode + '/settings/public');

    gameData = {};

    ref.once(
        'value',
        function (snapshot) {
            //only reads once - https://stackoverflow.com/questions/48939104/firebase-warning-cant-set-headers-after-they-are-sent
            var data = snapshot.val();
            gameData = data;

            //check time
            var timeState = helper.gameTime(gameData['start'], gameData['end']);

            var localOffset = helper.getOffset(true);

            if (timeState === 0) {
                //game hasn't started
                //only return the time and not the questions
                return res.json({
                    success: true,
                    message: 'here are the goods',
                    data: gameData,
                    offset: localOffset,
                });
            } else if (timeState === 1) {
                //game is going on
                ref = db.ref('Games/' + gameCode + '/questions');

                //gets the questions
                ref.once(
                    'value',
                    function (snapshot) {
                        var data = snapshot.val();

                        var questions = []; //this array will contain all of the questions

                        if (data != null) {
                            for (var key of Object.keys(data)) {
                                var shuffledChoices =
                                    data[key]['choices'] || [];
                                shuffledChoices =
                                    helper.shuffleArray(shuffledChoices);
                                questions.push({
                                    id: key,
                                    question: data[key]['q'],
                                    answer: '',
                                    type: data[key]['t'],
                                    choices: shuffledChoices,
                                    multiplier: data[key]['multiplier'] || 0,
                                    image: data[key]['image'],
                                }); //returns the question's id, actual question, image code, and blank for the answer
                            }
                        }

                        gameData['questions'] = questions;

                        return res.json({
                            success: true,
                            message: 'here are the goods',
                            data: gameData,
                            offset: localOffset,
                        });
                    },
                    function (errorObject) {
                        console.log('The read failed: ' + errorObject.code);
                        return res.json({
                            success: false,
                            message: errorObject.message,
                        });
                    },
                );
            } else if (timeState === 2) {
                //game is over
                ref = db.ref('Games/' + gameCode + '/questions');

                ref.once(
                    'value',
                    function (snapshot) {
                        //only reads once
                        var data = snapshot.val();

                        var questions = [];

                        if (data) {
                            for (var key of Object.keys(data)) {
                                var shuffledChoices =
                                    data[key]['choices'] || [];
                                shuffledChoices =
                                    helper.shuffleArray(shuffledChoices);
                                questions.push({
                                    id: key,
                                    question: data[key]['q'],
                                    answer: data[key]['a'],
                                    type: data[key]['t'],
                                    choices: shuffledChoices,
                                    multiplier: data[key]['multiplier'] || 0,
                                    image: data[key]['image'],
                                }); //returns the answer as well since the game is over
                            }
                        }

                        gameData['questions'] = questions;

                        return res.json({
                            success: true,
                            message: 'here are the goods',
                            data: gameData,
                            offset: localOffset,
                        });
                    },
                    function (errorObject) {
                        console.log('The read failed: ' + errorObject.code);
                        return res.json({
                            success: false,
                            message: errorObject.message,
                        });
                    },
                );
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
 * Returns the questions and time left
 */
router.get('/getGameType', auth.checkGameCode, async function (req, res) {
    let gameCode = req.headers['game'];

    let gameTypeResponse = await helper.getGameType(gameCode);

    if (gameTypeResponse.sucess) {
        return res.json({
            success: true,
            data: gameTypeResponse.data,
        });
    } else {
        return res.json({
            success: false,
            message: gameTypeResponse.message,
        });
    }
});

/* Makes every game private */

// router.get("/reorder", function(req, res) {

//   var db = admin.database();
//   var ref = db.ref("TotalGames");

//   ref.once("value", async function(snapshot) { //only reads once - https://stackoverflow.com/questions/48939104/firebase-warning-cant-set-headers-after-they-are-sent
//     var data = snapshot.val();

//     for (var code of Object.keys(data)) {
//       db.ref("Games/" + code + "/settings/private/public").set(false);

//     }

//     return res.json({
//       success: true
//     })

//   });

// })

/**
 * Clears the Scores
 */

router.post(
    '/clearTable',
    auth.level1,
    auth.checkGameCode,
    async function (req, res) {
        let gameCode = req.headers['game'];

        let clearedTable = await helper.clearTable(gameCode);

        if (clearedTable) {
            return res.json({
                success: true,
                message: 'Scores have been cleared.',
            });
        } else {
            return res.json({
                success: true,
                message: 'Error! The scores have not been cleared.',
            });
        }
    },
);

//Checks if a game exists and is live

router.post('/checkLive', async function (req, res) {
    let gameCode = req.headers['game'];

    if (gameCode === undefined || typeof gameCode != 'string') {
        return res.json({
            success: false,
            message: 'Improper game code',
        });
    }

    //check if the game exists
    var response = await helper.checkIfGameExists(gameCode);

    if (!response.exists) {
        return res.json({
            success: false,
            message: "This game doesn't exist!",
        });
    } else {
        var gameName = response.gameName;

        //check if the game is live
        let gameIsLive = await helper.checkGameIsLive(gameCode);

        if (gameIsLive) {
            return res.json({
                success: true,
                message: 'This game is live!',
                data: gameName,
            });
        } else {
            return res.json({
                success: false,
                message:
                    "This game isn't live yet! Please check with your teacher.",
            });
        }
    }
});

module.exports = router;
