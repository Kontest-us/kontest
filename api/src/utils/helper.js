var admin = require('firebase-admin');
var math = require('mathjs');
var compare = require('./compare');
var date = require('./date');

//Declare helper namespace

var helperNs = {};

/* Helper Methods */

/**
 * [Checks if the current time falls within a time interval
 * @param  {String} start Lower bound in datetime format
 * @param  {String} stop  Upper bound in datetime format
 * @return {Boolean}      If the current time is within the interval
 */
helperNs.checkTime = function (start, stop) {
    return date.checkTime(start, stop);
};

//instead of returning a boolean, it returns an integer that represents the state of the current time

/**
 * Returns an integer that represents the state of the current time
 * @param  {String} start Lower bound in datetime format
 * @param  {String} stop  upper bound in datetime format
 * @return {Integer}      0 - game hasn't started, 1 - game has started, 2 - game is over
 */

helperNs.gameTime = function (start, stop) {
    return date.gameTime(start, stop);
};

/**
 * checks if the current time falls within the start and stop time
 */
helperNs.goodTime = function (data) {
    //data is a JSON object

    return date.goodTime(data);
};

/**
 * Check if a string has bad characters in it
 * @param {String} name String being checked
 * @returns {Boolean}   True if the string doesn't have any of the bad characters
 */

function isNumber(string) {
    return (
        !isNaN(string) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(string))
    ); // ...and ensure strings of whitespace fail
}

helperNs.checkName = function (name) {
    if (typeof name != 'string') {
        return false;
    }

    if (name === '') {
        return false;
    }

    var bad = ['.', '$', '#', '[', ']', '<', '>', '/', '\\']; //characters that cannot be in the string

    for (var i = 0; i < name.length; i++) {
        for (var j = 0; j < bad.length; j++) {
            if (name[i] === bad[j]) {
                //bad character found
                return false;
            }
        }
    }

    return true;
};

helperNs.checkTeamName = function (teamName) {
    if (!helperNs.checkName(teamName)) {
        return false;
    }
    //name cannot be a number
    return !isNumber(teamName);
};

/**
 * Checks if a team has any guesses remaining
 * @param  {String} totalGuesses Total guesses allowed
 * @param  {String} data         JSON object with a guesses value
 * @return {Boolean}             If the team is allowed to keep guessing
 */

helperNs.remainingGuesses = function (totalGuesses, data) {
    var guessesAllowed = parseInt(data['guesses']);
    totalGuesses = parseInt(totalGuesses);

    return totalGuesses < guessesAllowed; //the team's current guesses have to be less than the number of guesses allwoed
};

/*
Checks if a game is a manual game, which is a game where teams shouldn't be deleted when empty and studetns cannot create teams
*/

helperNs.checkFreedom = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref(
            'Games/' + gameCode + '/settings/private/studentFreedom',
        );

        gameData = {};

        ref.once(
            'value',
            function (snapshot) {
                //only reads once
                var data = snapshot.val();

                resolve({
                    freedom: data,
                });
            },
            function (errorObject) {
                resolve({
                    freedom: 1, //lowest freedom
                });
            },
        );
    });
};

/*
Gets the max people allowed for that game
*/

helperNs.getMaxPerTeam = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/settings/public/maxPerTeam');

        ref.once(
            'value',
            function (snapshot) {
                //only reads once
                var max = snapshot.val();

                resolve({
                    max: max,
                });
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                resolve({
                    max: 1,
                });
            },
        );
    });
};

helperNs.getGameType = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/settings/public/type');

        ref.once(
            'value',
            function (snapshot) {
                //only reads once
                var type = snapshot.val();

                if (type) {
                    resolve({
                        success: true,
                        data: type,
                    });
                } else {
                    resolve({
                        success: false,
                        message:
                            'This game is outdated. Please delete the game and then create a new game.',
                    });
                }
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                resolve({
                    success: false,
                    message: errorObject.message,
                });
            },
        );
    });
};

helperNs.getGameAdmins = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/admins');

        ref.once('value', function (snapshot) {
            //only reads once
            var admins = snapshot.val();
            resolve(admins);
        });
    });
};

helperNs.getGameQuestions = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/questions');

        ref.once('value', function (snapshot) {
            //only reads once
            var questions = snapshot.val();
            resolve(questions);
        });
    });
};

helperNs.getFullGameSettings = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/settings');

        ref.once('value', function (snapshot) {
            //only reads once
            var settings = snapshot.val();
            resolve(settings);
        });
    });
};

/**
 * Returns the number of guesses and start/stop time for the current game
 */

helperNs.getGameSettings = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/settings/');

        ref.once('value', function (snapshot) {
            //only reads once
            var settings = snapshot.val();
            let gameData = {};

            gameData['start'] = settings.public.start;
            gameData['end'] = settings.public.end;
            gameData['guesses'] = settings.public.guesses;
            gameData['live'] = settings.private.live;

            resolve({
                data: gameData,
            });
        });
    });
};

/**
 * Replaces a character in a string with another character; used for encoding and decoding emails since firebase doesn't support "."
 * @param  {String} string full string
 * @param  {String} c      bad character
 * @param  {String} r      good character
 * @return {String}        replaced string
 */

helperNs.replaceAll = function (string, c, r) {
    var s = '';
    for (var i = 0; i < string.length; i++) {
        if (string[i] === c) {
            s += r;
        } else {
            s += string[i];
        }
    }
    return s;
};

helperNs.getQuestionMult = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/questions');

        ref.once(
            'value',
            function (snapshot) {
                //only reads once
                var questionsData = snapshot.val();

                var parsedData = [];

                if (questionsData) {
                    for (var key of Object.keys(questionsData)) {
                        var questionData = questionsData[key];
                        parsedData.push({
                            type: questionData.t,
                            multiplier: questionData.multiplier || 0,
                        });
                    }
                }

                resolve(parsedData);
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                resolve(null);
            },
        );
    });
};

//Rounds number to the nearest 5 (ex 6.25 rounds to 5)
function round5(x) {
    return x % 5 >= 2.5 ? parseInt(x / 5) * 5 + 5 : parseInt(x / 5) * 5;
}

/**
 * Returns a game's scoreboard/table based on the raw data in firebase and the number of questions
 * @param {int} numQuestions number of questions
 * @param {JSON} data        raw data from firebase
 */

helperNs.getTable = function (questionData, numQuestions, data) {
    //not a single team exists
    if (data === null || questionData === null) {
        return {
            table: [],
            isEstimathon: false,
        };
    }

    //before we do anything, we check to see if this contest is an estimathon contest

    var isEstimathon = true; //assume is an estimathon
    for (var i = 0; i < questionData.length; i++) {
        if (questionData[i]['type'] != 'e') {
            isEstimathon = false;
            break;
        }
    }

    var table = [];

    //iterate through every team
    for (var key of Object.keys(data)) {
        var teamName = key;
        //team data will hold a team's name, total score, number of guesses, and all of its answers for every question
        var teamData = {
            teamName: teamName,
        };

        var scores = []; //scores for every question
        var ans = []; //answers for every question
        var guesses = []; //guesses for every question
        var goodIntervals = 0; //used for calculating team score
        var scoreSum = 0;

        for (var i = 0; i < numQuestions; i++) {
            if ('points' in data[key]) {
                if (String(i) in data[key]['points']) {
                    //check if the question has been answered
                    var pointVal = data[key]['points'][String(i)];

                    //if this question is estimating, push regular value
                    //else, push value multiplied by multiplier

                    //actually got the question right
                    if (String(pointVal)[0] != 'X') {
                        goodIntervals += 1;
                        if (questionData[i]['type'] === 'e') {
                            //Deprecated as of 8/10/2021
                            //Scores estimathons such that more points are better
                            // let questionScore = 117.324434 * Math.pow(0.85412, parseInt(pointVal)); //this is is between 0-100. You get 100 if pointVal is 1.

                            // if(questionScore <= 5) { //round to 2 decimal places if less than 1
                            //     questionScore = 5;
                            // } else { //round to the nearest whole number
                            //     questionScore = round5(questionScore) //rounds to the nearest five
                            // }

                            // scores.push(pointVal)
                            // scoreSum += questionScore;

                            scores.push(pointVal);
                            scoreSum += parseInt(pointVal);
                        } else {
                            //round the multipled score to the hundredths place
                            var multipledScore =
                                parseFloat(pointVal) *
                                parseFloat(questionData[i]['multiplier']);

                            if (multipledScore > 1) {
                                multipledScore = Math.round(multipledScore);
                            } else {
                                multipledScore =
                                    Math.round(multipledScore * 100) / 100;
                            }
                            scores.push(multipledScore);
                            scoreSum += multipledScore;
                        }
                    } else {
                        //push string full of X indicating a wrong answer
                        scores.push(pointVal);
                    }
                } else {
                    //if the question hasn't been answered, set as 0
                    scores.push(0);
                }
            } else {
                //no questions have been answered
                scores.push(0);
            }

            if ('ans' in data[key]) {
                if (String(i) in data[key]['ans']) {
                    //check if the question has been answered
                    var ansVal = data[key]['ans'][String(i)];

                    //actually got the question right
                    ans.push(ansVal);
                } else {
                    //if the question hasn't been answered, set as 0
                    ans.push('');
                }
            } else {
                //no questions have been answered
                ans.push('');
            }

            if ('guess' in data[key]) {
                if (String(i) in data[key]['guess']) {
                    //check if the question has been answered
                    var guessVal = data[key]['guess'][String(i)];

                    //actually got the question right
                    guesses.push(parseInt(guessVal));
                } else {
                    //if the question hasn't been answered, set as 0
                    guesses.push(0);
                }
            } else {
                //no questions have been answered
                guesses.push(0);
            }
        }

        var totalScore = 0;

        function getBaseLog(x, y) {
            if (x == 0 || y == 0) {
                return 0;
            }

            return Math.log(y) / Math.log(x);
        }

        if (isEstimathon) {
            //apply estimathon formula
            // totalScore = (5 + scoreSum) * Math.pow(2, numQuestions - goodIntervals); //equation for calculating total score
            // totalScore = Math.round(totalScore);
            totalScore = scoreSum + 1000 * (numQuestions - goodIntervals);
        } else {
            totalScore = scoreSum;
        }

        teamData['scores'] = scores;
        teamData['answers'] = ans;
        teamData['guesses'] = guesses;
        teamData['totalScore'] = Math.round(totalScore * 100) / 100; //round to hundredths place
        teamData['totalGuesses'] = data[key]['totalGuesses'];

        table.push(teamData); //add to the table
    }

    return { table: table, isEstimathon: isEstimathon };
};

helperNs.clearTable = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/teams');

        ref.once(
            'value',
            async function (snapshot) {
                //only reads once
                var data = snapshot.val();

                //if teams exist for this game
                if (data) {
                    for (var key of Object.keys(data)) {
                        var teamName = key;
                        db.ref(
                            'Games/' +
                            gameCode +
                            '/teams/' +
                            teamName +
                            '/points',
                        ).remove(); //removes each team's points
                        db.ref(
                            'Games/' + gameCode + '/teams/' + teamName + '/ans',
                        ).remove(); //removes each team's answers
                        db.ref(
                            'Games/' +
                            gameCode +
                            '/teams/' +
                            teamName +
                            '/guess',
                        ).remove(); //removes each team's guesses for each question

                        //sets the total guesses to 0
                        db.ref(
                            'Games/' +
                            gameCode +
                            '/teams/' +
                            teamName +
                            '/totalGuesses',
                        ).set(0);
                    }
                }

                resolve(true);
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                resolve(false);
            },
        );
    });
};

helperNs.compareMathValues = function (a, b) {
    return compare.compareExpressions(a, b, false);
};

/**
 * @deprecated Since we added compare.js
 * @param {String}  a represents a fraction or decimal
 * @param {String}  b represents a fraction or decimal
 * @returns         If the number represented by a is close to the number represented by b
 */
helperNs.compareNumericalValues = function (a, b) {
    //try catch in place in case the fractions/decimals passed in aren't actually numbers
    try {
        a = math.rationalize(a).toString();
        b = math.rationalize(b).toString();

        //a or b aren't actual numerical values
        if (isNaN(a) || isNaN(b)) {
            return false;
        }

        a = parseFloat(a);
        b = parseFloat(b);

        let distance = -3; //distance between two numbers has to be 10^distance or lower

        return Math.abs(a - b) <= Math.pow(10, distance);
    } catch (error) {
        return false;
    }
};

helperNs.compareTextValues = function (a, b) {
    //try catch in place in case the text passed in can't be converted
    try {
        return a.toLowerCase() === b.toLowerCase();
    } catch (error) {
        return false;
    }
};

/**
 *  Adds to the number of times that this team has guessed for this question
 * @param {String} gameCode
 * @param {String} teamName
 * @parem {String} questionOrder
 */
helperNs.incrementQuestionGuesses = function (
    gameCode,
    teamName,
    questionOrder,
) {
    return new Promise(async function (resolve, reject) {
        //asynchronous method
        var db = admin.database();
        db.ref(
            'Games/' +
            gameCode +
            '/teams/' +
            teamName +
            '/guess/' +
            questionOrder,
        )
            .transaction(function (current_value) {
                var times = current_value || 0;
                times += 1;
                return times;
            })
            .then((result) => {
                resolve(true);
            });
    });
};

/**
 * Adds an X to a team's points
 * @param {String} gameCode
 * @param {String} teamName
 * @parem {String} questionOrder
 */

helperNs.updateBadGuess = function (gameCode, teamName, questionOrder) {
    return new Promise(async function (resolve, reject) {
        //asynchronous method
        var db = admin.database();
        //adds an X for that question
        db.ref(
            'Games/' +
            gameCode +
            '/teams/' +
            teamName +
            '/points/' +
            questionOrder,
        )
            .transaction(function (current_value) {
                //check if this current_value is a number
                //if the value is a number, we do not want to continue
                //since the player is just overwritting their good answer
                //and wasting a guess

                //isNan returns false if the value is a number
                //however, isNaN(null) === false, so we must check if current_value is NaN

                //UPDATE: DEPRECATED - allow players to overwrite bad answers

                // if(current_value != null && !isNaN(current_value)) {
                //   isGoodAnswer = true;
                //   return current_value;
                // }

                val = current_value || '';

                val = String(val);

                if (val[0] === 'X') {
                    //x already exists
                    val += 'X';
                } else {
                    //new x
                    val = 'X';
                }

                return val;
            })
            .then((result) => {
                resolve(val);
            });
    });
};

/**
 * Saves an answer choice that a team has guessed for a multiple choice question
 */

helperNs.addMultGuessAnswer = function (
    gameCode,
    teamName,
    questionOrder,
    answer,
) {
    return new Promise(async function (resolve, reject) {
        //asynchronous method
        var db = admin.database();

        db.ref(
            'Games/' +
            gameCode +
            '/teams/' +
            teamName +
            '/ans/' +
            questionOrder,
        )
            .transaction(function (current_value) {
                var guessedAnswers = current_value || '';
                if (guessedAnswers.length > 0) {
                    guessedAnswers += '`' + answer;
                } else {
                    guessedAnswers = answer;
                }
                return guessedAnswers;
            })
            .then((result) => {
                resolve(true);
            });
    });
};

/*
Checks if a team has a good answer for a question
*/
helperNs.checkGoodAnswer = function (gameCode, teamName, questionOrder) {
    return new Promise(async function (resolve, reject) {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref(
            'Games/' +
            gameCode +
            '/teams/' +
            teamName +
            '/points/' +
            questionOrder,
        );

        ref.once(
            'value',
            async function (snapshot) {
                //only reads once
                var hasAnswer = snapshot.val();

                if (hasAnswer) {
                    if (String(hasAnswer).length > 0) {
                        if (String(hasAnswer)[0] != 'X') {
                            //doesn't have an X
                            resolve(true);
                        }
                    }
                }
                resolve(false);
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                resolve(true);
            },
        );
    });
};

/**
 * Removes a game from Firebase
 * @param {String} gameCode The game's code in firebase
 */

helperNs.deleteGame = function (gameCode) {
    return new Promise(async function (resolve, reject) {
        //asynchronous method
        var db = admin.database();

        // delete each image from storage
        const imagesDeleted = await helperNs.deleteImages(gameCode);

        // if images deleted successfully, continue
        if (imagesDeleted) {
            //get each admin for this game

            var ref = db.ref('Games/' + gameCode + '/admins');

            ref.once(
                'value',
                async function (snapshot) {
                    //only reads once
                    var admins = snapshot.val();

                    //delete each admin's record

                    //if there are emails
                    if (admins != null) {
                        for (var adminUID of Object.keys(admins)) {
                            //now delete every record of the game underneath an admin
                            db.ref(
                                'Admins/' + adminUID + '/games/' + gameCode,
                            ).remove();
                        }
                    }

                    //delete the game itself

                    db.ref('Games/' + gameCode).remove();

                    //delete the game from the second spot

                    db.ref('TotalGames/' + gameCode).remove();

                    //Remove from public games spot
                    db.ref('Public/' + gameCode).remove();

                    resolve({
                        success: true,
                        message: 'Game has been deleted!',
                    });
                },
                function (errorObject) {
                    console.log('The read failed: ' + errorObject.code);
                    resolve({
                        success: false,
                        message: 'Error, please try again!',
                    });
                },
            );
        } else {
            resolve({
                success: false,
                message: 'Error deleting images, please try again!',
            });
        }
    });
};

/**
 * deletes all images from storage
 * @param gameCode
 * @returns {Promise<unknown>}
 */
helperNs.deleteImages = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();
        var ref = db.ref('Games/' + gameCode + '/questions');

        ref.once(
            'value',
            async function (snapshot) {
                //only reads once
                var questions = snapshot.val();
                // check if there are questions
                if (questions != null) {
                    var dict = {};

                    for (var key of Object.keys(questions)) {
                        // check if there is an image for that question
                        if (questions[key]['image'] !== '') {
                            // delete image for that question
                            await admin
                                .storage()
                                .bucket()
                                .file(
                                    'questions/' +
                                    gameCode +
                                    '/' +
                                    questions[key]['image'],
                                )
                                .delete()
                                .then(() => {
                                    dict[key] = true;
                                })
                                .catch((error) => {
                                    // Uh-oh, an error occurred!
                                    resolve(false);
                                });
                        }
                    }

                    resolve(true);
                } else {
                    resolve(true);
                }
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                resolve(false);
            },
        );
    });
};

/**
 * Returns boolean indicating whether or not a game is live
 * @param {String} gameCode Game's Code
 */
helperNs.checkGameIsLive = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/settings/private/live');

        ref.once(
            'value',
            function (snapshot) {
                //only reads once

                var isLive = snapshot.val();

                if (isLive !== null) {
                    resolve(isLive);
                }

                resolve(false);
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
                console.log(errorObject.message);
                resolve(false);
            },
        );
    });
};

helperNs.checkStudentOnTeam = function (studentName, gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/students/' + studentName);

        ref.once('value', async function (snapshot) {
            //only reads once
            var student = snapshot.val();

            let onTeam = student != null;

            resolve(onTeam); //returns true if student on a team
        });
    });
};

/**
 * Removes an admin from a game and deletes the game if the admin created the game
 * @param {String} uid An admins's uid
 * @param {String} gameCode The games' code
 */

helperNs.removeAdminFromGame = function (adminID, gameCode) {
    return new Promise((resolve) => {
        //asynchronous method

        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/admins/head');

        ref.once(
            'value',
            async function (snapshot) {
                //only reads once
                var headID = snapshot.val(); //change to the score has been made

                if (headID && headID === adminID) {
                    //remove the game from the admin spot
                    db.ref('Admins/' + adminID + '/games/' + gameCode).remove();

                    //delete the game since the admin created this game
                    var response = await helperNs.deleteGame(gameCode);

                    resolve({
                        success: response.success,
                        message: response.message,
                    });
                } else {
                    //just remove the admin from this game

                    //first spot
                    db.ref('Games/' + gameCode + '/admins/' + adminID).remove();

                    //second spot
                    db.ref('Admins/' + adminID + '/games/' + gameCode).remove();

                    resolve({
                        success: true,
                        message: 'You have been removed from this game.',
                    });
                }
            },
            function (errorObject) {
                resolve({
                    success: false,
                    message: 'Error, please try again!',
                });
            },
        );
    });
};

helperNs.randomUID = function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;

    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
};

helperNs.checkIfGameExists = function (gameCode) {
    return new Promise((resolve) => {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('TotalGames/' + gameCode);

        //checks if a team with the new team's name already exists
        ref.once(
            'value',
            async function (snapshot) {
                //only reads once
                var data = snapshot.val();

                let gameExists = data != null;

                resolve({
                    exists: gameExists, //if data exists at that location, then the game exists,
                    gameName: data,
                });
            },
            function (errorObject) {
                console.log('Check if game exists error');
                console.log(errorObject.message);
                //error, return true
                resolve({
                    exists: false,
                });
            },
        );
    });
};

/**
 * Updates a team based on its name, array of student names, and totalGuesses
 * @param {JSON object} newTeam
 * Possible new team below
 * var newTeam = {
      name: "Team 1",
      allNames: ["joe", "bob", "ana"],
      totalGuesses: 0
    }
 */

helperNs.updateTeam = function (gameCode, oldNames, newTeam) {
    return new Promise(async function (resolve, reject) {
        //asynchronous method

        var db = admin.database();

        //Now, we update firebase by removing old names and adding the new names

        var newStudents = newTeam.allStudents; //passed in, has "."

        //for every new email, update it in the database in the second spot
        for (var i = 0; i < newStudents.length; i++) {
            db.ref(
                'Games/' + gameCode + '/students/' + newStudents[i]['name'],
            ).set({
                team: newTeam.name,
                id: newStudents[i]['id'],
            });
        }

        //for the names removed, remove from second spot
        for (var i = 0; i < oldNames.length; i++) {
            var found = false;
            for (var j = 0; j < newStudents.length; j++) {
                if (oldNames[i] === newStudents[j]['name']) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                //this email isn't meant to be added back
                db.ref(
                    'Games/' + gameCode + '/students/' + oldNames[i],
                ).remove();
            }
        }

        var data = await helperNs.checkFreedom(gameCode);

        if (newStudents.length === 0 && data.freedom === 3) {
            //team has no members left so we can delete it, but only if the game isn't manual (freedom <= 2)
            //delete whole team
            db.ref('Games/' + gameCode + '/teams/' + newTeam.name).remove();
            db.ref(
                'Games/' + gameCode + '/totalteams/' + newTeam.name,
            ).remove();

            //decrease number of teams
            db.ref(
                'Games/' + gameCode + '/settings/public/numTeams',
            ).transaction(function (current_value) {
                var c = current_value || 0;
                c = parseInt(c);
                if (c > 0) return current_value - 1;
                return 0;
            });

            resolve({
                success: true,
                message:
                    'Team has been updated. This team has also been deleted.',
            });
        } else {
            //finally, update the team with the remaining emails
            db.ref('Games/' + gameCode + '/teams/' + newTeam.name).update({
                totalGuesses: newTeam.totalGuesses,
                allStudents: newStudents,
            });

            resolve({
                success: true,
                message: 'Team has been updated.',
            });
        }
    });
};

/**
 *
 * @param {String} a first number, can be in normal or e notation
 * @param {String} b second number, can be in normal (2000) or e notation (2e3)
 * @returns {boolean} true if a >= b
 */

helperNs.compareNumbers = function (a, b) {
    //first, convert a and b into scientific notation

    if (a.indexOf('e') < 0) {
        a = String(Number(a).toExponential());
    }

    if (b.indexOf('e') < 0) {
        b = String(Number(b).toExponential());
    }

    //next, get constant and power

    let a_eIndex = a.indexOf('e');
    let b_eIndex = b.indexOf('e');

    let a_first = a.substring(0, a_eIndex);
    let b_first = b.substring(0, b_eIndex);

    let a_second = a.substring(a_eIndex + 1, a.length);
    let b_second = b.substring(b_eIndex + 1, b.length);

    //exponent power is the same, so we now check the number being multipled
    if (parseInt(a_second) === parseInt(b_second)) {
        //check constant being multiplied
        return parseFloat(a_first) >= parseFloat(b_first);
    } else {
        return parseInt(a_second) > parseInt(b_second); //return true if a has a larger power
    }
};

/**
 *
 * @param {String} a first number, can be in normal or e notation
 * @param {String} b second number, can be in normal (2000) or e notation (2e3)
 * @returns {Float} Floor(a/b)
 */

helperNs.divideNumbers = function (a, b) {
    //first, convert a and b into scientific notation

    if (a.indexOf('e') < 0) {
        a = String(Number(a).toExponential());
    }

    if (b.indexOf('e') < 0) {
        b = String(Number(b).toExponential());
    }

    //next, get constant and power

    let a_eIndex = a.indexOf('e');
    let b_eIndex = b.indexOf('e');

    let a_first = a.substring(0, a_eIndex);
    let b_first = b.substring(0, b_eIndex);

    let a_second = a.substring(a_eIndex + 1, a.length);
    let b_second = b.substring(b_eIndex + 1, b.length);

    //Just to prevent dividing really large numbers
    if (Number(a_second) - Number(b_second) > 5) {
        return 0;
    }

    let val =
        (Number(a_first) / Number(b_first)) *
        Math.pow(10, Number(a_second) - Number(b_second));

    //Val might be subject to floating point error, so we do the following:
    //source: https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
    val = parseFloat(val).toPrecision(12);

    //Finally apply floor, giving those who answer 500-2499 a better score than those who answered 500-2500
    val = Math.floor(val);

    //The max that val can be is 999. Thus, we must catch this

    if (val > 999) {
        return 0;
    }

    return val;
};

/*

Checks if a number is zero

*/
helperNs.checkZero = function (a) {
    let b = String(a);

    for (var i = 0; i < b.length; i++) {
        //found a character that indicates the number is not a zero
        if (b.substring(i, i + 1) != '0' && b.substring(i, i + 1) != '.') {
            return false;
        }
    }
    return true;
};

helperNs.shuffleArray = function (array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

/**
 * Finds the milliseconds elapsed since January 1, 1970, 00:00:00, UTC (standard datetime)
 * @param includeSeconds Whether to include seconds in this calculation
 * @returns Number representing milliseconds elapsed since standard datetime
 */
helperNs.getOffset = function (includeSeconds) {
    return date.getOffset(includeSeconds);
};

helperNs.timeToServer = function (clientOffset, time, includeSeconds) {
    return date.timeToServer(clientOffset, time, includeSeconds);
};

helperNs.checkPublic = function (gameCode) {
    return new Promise(async function (resolve, reject) {
        //asynchronous method
        var db = admin.database();

        var ref = db.ref('Public/' + gameCode);

        ref.once(
            'value',
            async function (snapshot) {
                //only reads once
                var data = snapshot.val(); //change to the score has been made

                resolve({
                    success: true,
                    isPublic: data !== null,
                    message: 'Checked if game is public',
                });
            },
            function (errorObject) {
                resolve({
                    success: false,
                    isPublic: false,
                    message: 'Error, please try again!',
                });
            },
        );
    });
};

// Export all the things! *\('o')|
for (prop in helperNs) {
    if (helperNs.hasOwnProperty(prop)) {
        //make sure the key belongs to this JSON object
        module.exports[prop] = helperNs[prop];
    }
}
