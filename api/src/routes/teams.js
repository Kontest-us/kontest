/* Dependencies */

const express = require('express');
var router = express.Router();
var helper = require('../utils/helper');
var auth = require('../utils/auth');
var admin = require('firebase-admin');

/*
Teams (CRUD)
*/

/**
 * Creates a new team for a specific game
 */
router.post(
    '/create',
    auth.level1,
    auth.checkGameCode,
    auth.validateBody,
    function (req, res) {
        let gameCode = req.headers['game'];

        //JSON object that represents the new team
        var newTeam = {
            name: req.body.name,
            allStudents: req.body.allStudents,
        };

        if (newTeam.name === undefined || newTeam.allStudents === undefined) {
            return res.json({
                success: false,
                message: 'Improper request',
            });
        }

        var db = admin.database();
        var ref = db.ref('Games/' + gameCode + '/totalteams/' + newTeam.name);

        //checks if a team with the new team's name already exists
        ref.once(
            'value',
            function (snapshot) {
                //only reads once
                var data = snapshot.val();

                if (data === true) {
                    //cannot create a new team
                    return res.json({
                        success: false,
                        message:
                            'A team with the same name has already been created. Please choose another name.',
                    });
                }

                //make sure the team name isn't bad

                if (!helper.checkTeamName(newTeam.name)) {
                    return res.json({
                        success: false,
                        message:
                            'Please enter a team name without any bad characters, like ., $, #, [, and ]. Also, please avoid naming a team just a number.',
                    });
                }

                //now, make sure that each student's name doesn't contain bad characters

                let badName = false;

                newTeam.allStudents.forEach((student) => {
                    badName = !helper.checkName(student['name']);
                });

                if (badName) {
                    return res.json({
                        success: false,
                        message:
                            'Please enter student names without any non-letter characters.',
                    });
                }

                //add new team
                db.ref('Games/' + gameCode + '/teams/' + newTeam.name).set({
                    totalGuesses: 0,
                    allStudents: newTeam.allStudents,
                });

                //increment the total number of teams
                db.ref('Games/' + gameCode + '/settings/public/numTeams')
                    .transaction(function (current_value) {
                        var c = current_value || 0;
                        c = parseInt(c);
                        return c + 1;
                    })
                    .then((result) => {
                        //A second spot that stores the team name. This is used so that searching for a team takes O(1) time.
                        db.ref(
                            'Games/' + gameCode + '/totalteams/' + newTeam.name,
                        ).set(true);

                        //A second spot for storing a student email. This is used so that searching for a student takes O(1) time.
                        for (var i = 0; i < newTeam.allStudents.length; i++) {
                            db.ref(
                                'Games/' +
                                gameCode +
                                '/students/' +
                                newTeam.allStudents[i]['name'],
                            ).set({
                                team: newTeam.name,
                                id: newTeam.allStudents[i]['id'],
                            });
                        }

                        var ref = db.ref(
                            'Games/' + gameCode + '/settings/public',
                        );

                        //makes sure that score visibility is changed
                        ref.once(
                            'value',
                            function (snapshot) {
                                var data = snapshot.val();
                                var numTeams = parseInt(data.numTeams);
                                var previousScoreVisibility = parseInt(
                                    data.scoreVisibility.num,
                                );
                                var allOrNot = data.scoreVisibility.all;

                                if (allOrNot) {
                                    db.ref(
                                        'Games/' +
                                        gameCode +
                                        '/settings/public/scoreVisibility',
                                    ).set({
                                        // if scoreVisibility is set to all, the num is updated to numTeams
                                        num: numTeams,
                                        all: true,
                                    });
                                } else {
                                    if (previousScoreVisibility > numTeams) {
                                        db.ref(
                                            'Games/' +
                                            gameCode +
                                            '/settings/public/scoreVisibility',
                                        ).set({
                                            // if all is false, and if num > numTeams, then num is set to numTeams
                                            num: numTeams,
                                            all: allOrNot,
                                        });
                                    }
                                }
                                return res.json({
                                    success: true,
                                    message: 'Team has been created.',
                                });
                            },
                            function (errorObject) {
                                return res.json({
                                    success: false,
                                    message: errorObject.message,
                                });
                            },
                        );
                    });
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
            },
        );
    },
);

/**
 * Updates a team's student names and total guesses based on its name
 */
router.post('/update', auth.level1, auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];

    //team that is passed in the request
    var newTeam = {
        name: req.body.name,
        allStudents: req.body.allStudents,
        totalGuesses: req.body.totalGuesses,
    };

    if (
        newTeam.name === undefined ||
        newTeam.allStudents === undefined ||
        newTeam.totalGuesses === undefined
    ) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    var db = admin.database();
    var ref = db.ref('Games/' + gameCode + '/teams/' + newTeam.name);

    //makes sure that the team exists
    ref.once(
        'value',
        async function (snapshot) {
            var data = snapshot.val();

            if (data === null) {
                return res.json({
                    success: false,
                    message: "Team doesn't exist.",
                });
            } else {
                var badName = false;

                //before we do anything, we must check that all of the names don't contain bad characters
                newTeam.allStudents.forEach((student) => {
                    badName = !helper.checkName(student['name']);
                });

                if (badName) {
                    return res.json({
                        success: false,
                        message:
                            'Please enter student names without any non-letter characters.',
                    });
                }

                var oldNames = []; //from firebase
                let oldTeam = data['allStudents'];

                if (oldTeam) {
                    //add each person on this team prior to the change to the array oldNames
                    for (var key of Object.keys(oldTeam)) {
                        //now add every person
                        oldNames.push(oldTeam[key]['name']);
                    }
                }

                //Finally, we can update the team

                let updateResponse = await helper.updateTeam(
                    gameCode,
                    oldNames,
                    newTeam,
                );

                res.json({
                    message: updateResponse.message,
                    success: updateResponse.success,
                });
            }
        },
        function (errorObject) {
            console.log('The read failed: ' + errorObject.code);
        },
    );
});

/**
 * Returns all of the teams
 */

router.get('/get', auth.level1, auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];

    var db = admin.database();
    var ref = db.ref('Games/' + gameCode + '/teams');

    ref.once(
        'value',
        function (snapshot) {
            //only reads once - https://stackoverflow.com/questions/48939104/firebase-warning-cant-set-headers-after-they-are-sent
            var data = snapshot.val();

            if (data != null) {
                //data contains a JSOn Object where the keys are team names
                //each team object contains the student names and ids that belong to that team
                return res.json({
                    success: true,
                    message: 'All teams.',
                    data: data,
                });
            } else {
                return res.json({
                    success: true,
                    message: 'All teams.',
                    data: {}, //returns empty dictionary if a team doesn't exist
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
 * Deletes a specific team based on its name
 */

router.delete('/delete', auth.level1, auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];

    var teamName = req.body.name; //team name

    if (teamName === undefined) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    var db = admin.database();

    var ref = db.ref(
        'Games/' + gameCode + '/teams/' + teamName + '/allStudents',
    );

    ref.once(
        'value',
        async function (snapshot) {
            //only reads once

            //delete all names part of this from second spot

            var allStudents = snapshot.val();

            //if there are names
            if (allStudents != null) {
                for (var key of Object.keys(allStudents)) {
                    //now delete every email
                    db.ref(
                        'Games/' +
                        gameCode +
                        '/students/' +
                        allStudents[key]['name'],
                    ).remove();
                }
            }

            //remove the team from the other spots

            db.ref('Games/' + gameCode + '/teams/' + teamName).remove();
            db.ref('Games/' + gameCode + '/totalteams/' + teamName).remove();

            //decrease number of teams
            db.ref('Games/' + gameCode + '/settings/public/numTeams')
                .transaction(function (current_value) {
                    var c = current_value || 0;
                    c = parseInt(c);
                    if (c > 0) return current_value - 1;
                    return 0;
                })
                .then((result) => {
                    //makes sure that score visibility is changed

                    var ref = db.ref('Games/' + gameCode + '/settings/public');
                    ref.once(
                        'value',
                        function (snapshot) {
                            var data = snapshot.val();
                            var numTeams = parseInt(data.numTeams);
                            var previousScoreVisibility = parseInt(
                                data.scoreVisibility.num,
                            );
                            var allOrNot = data.scoreVisibility.all;

                            if (allOrNot) {
                                db.ref(
                                    'Games/' +
                                    gameCode +
                                    '/settings/public/scoreVisibility',
                                ).set({
                                    // if scoreVisibility is set to all, the num is updated to numTeams
                                    num: numTeams,
                                    all: true,
                                });
                            } else {
                                if (previousScoreVisibility > numTeams) {
                                    db.ref(
                                        'Games/' +
                                        gameCode +
                                        '/settings/public/scoreVisibility',
                                    ).set({
                                        // if all is false, and if num > numTeams, then num is set to numTeams
                                        num: numTeams,
                                        all: allOrNot,
                                    });
                                }
                            }

                            return res.json({
                                success: true,
                                message: 'Team has been deleted.',
                            });
                        },
                        function (errorObject) {
                            console.log('The read failed: ' + errorObject.code);
                        },
                    );
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
});

/**
 * Deletes all of the teams for a specific game
 */

router.delete('/clear', auth.level1, auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];

    var db = admin.database();

    //remove the team from two locations

    db.ref('Games/' + gameCode + '/teams').remove();
    db.ref('Games/' + gameCode + '/totalteams').remove();

    //removes all of the students
    db.ref('Games/' + gameCode + '/students').remove();
    db.ref('Games/' + gameCode + '/settings/public/numTeams').set(0); //0 teams now remaining
    db.ref('Games/' + gameCode + '/settings/public/scoreVisibility/num').set(0); //0 teams now remaining

    return res.json({
        success: true,
        message: 'All of the teams have been deleted.',
    });
});

/**
 * Gets the names of all of the existing teams
 */

router.get('/getNames', auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];

    var db = admin.database();
    var ref = db.ref('Games/' + gameCode + '/totalteams');

    ref.once(
        'value',
        function (snapshot) {
            //only reads once - https://stackoverflow.com/questions/48939104/firebase-warning-cant-set-headers-after-they-are-sent
            var data = snapshot.val();
            if (data != null) {
                return res.json({
                    success: true,
                    message: 'All team names.',
                    data: data,
                });
            } else {
                return res.json({
                    success: true,
                    message: 'All team names.',
                    data: {}, //empty dictionary if no teams exist
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

router.post('/randomTeams', auth.checkGameCode, function (req, res) {
    let gameCode = req.headers['game'];
    var db = admin.database();

    //first, read in all of the students
    var ref = db.ref('Games/' + gameCode + '/students');

    ref.once(
        'value',
        async function (snapshot) {
            //only reads once
            var students = snapshot.val();
            if (students === null) {
                return res.json({
                    success: false,
                    message: 'No teams have been created',
                });
            } else {
                var studentsArray = [];
                var teams = {};

                //next, append names to an array and teams to a dictionary
                for (var name in students) {
                    if (students.hasOwnProperty(name)) {
                        var studentData = students[name];
                        var studentTeam = studentData['team'];
                        var studentId = studentData['id'];

                        //add team if it already wasn't added
                        if (!(studentTeam in teams)) {
                            teams[studentTeam] = [];
                        }

                        studentsArray.push({ name: name, id: studentId });
                    }
                }

                //randomly remove a student, add to a team, move onto the next team,
                //and repeat until students remain

                var teamKeys = Object.keys(teams);
                var totalTeams = teamKeys.length;

                let i = 0;
                while (studentsArray.length > 0) {
                    //get a random student
                    let randomIndex = Math.floor(
                        Math.random() * studentsArray.length,
                    );
                    let student = studentsArray.splice(randomIndex, 1);
                    student = student[0];

                    //get the team
                    var currTeam = i % totalTeams;

                    //add to team
                    teams[teamKeys[currTeam]].push(student);

                    //next team
                    i += 1;
                }

                //update firebase
                for (key in teams) {
                    let newTeam = {
                        name: key,
                        allStudents: teams[key],
                        totalGuesses: 0, //automatically sets total guesses to 0
                    };

                    oldNames = [];

                    let response = await helper.updateTeam(
                        gameCode,
                        oldNames,
                        newTeam,
                    );

                    //error
                    if (!response.success) {
                        //return error message
                        return res.json({
                            message: response.message,
                            success: response.success,
                        });
                    }
                }

                let clearedTable = await helper.clearTable(gameCode);

                //all done now, we can finally end send back a response
                return res.json({
                    message: 'The teams have been randomly shuffled!',
                    success: true,
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
