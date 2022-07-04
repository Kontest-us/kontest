/* Dependencies */

const express = require('express');
var router = express.Router();
var helper = require('../utils/helper');
var auth = require('../utils/auth');
var admin = require('firebase-admin');

//compares a student name against their student id

router.post('/check', auth.checkGameCode, async function (req, res) {
    var db = admin.database();

    let gameCode = req.headers['game'];

    let studentName = req.body.name;

    if (!helper.checkName(studentName)) {
        return res.json({
            success: false,
            message:
                'Your name has improper characters. For example, it may be just a number. Please enter a new name.',
        });
    }

    var ref = db.ref('Games/' + gameCode + '/students/' + studentName);

    ref.once('value', async function (snapshot) {
        //only reads once
        var student = snapshot.val();

        if (student) {
            return res.json({
                success: true,
                showId: student['id'] != '', //if a student has an id, then they must enter it to continue
            });
        } else {
            //new student joining game
            return res.json({
                success: true,
                showId: true, //must enter an id
            });
        }
    });
});

/**
 * Returns a students team based on their name
 */

router.post('/get', auth.checkGameCode, async function (req, res) {
    let gameCode = req.headers['game'];

    var studentName = req.body.studentName; //student's name
    var studentId = req.body.studentId; //students id

    if (studentName === undefined) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    //first, check if the student name is good

    if (!helper.checkName(studentName)) {
        return res.json({
            success: false,
            message: 'Please enter a name with only letters.',
        });
    }

    //next, let's figure out if this game's student freedom. we will be sending this data to the client later.

    var freedom = await helper.checkFreedom(gameCode);
    freedom = freedom.freedom;

    var db = admin.database();

    var ref = db.ref('Games/' + gameCode + '/students/' + studentName);

    ref.once(
        'value',
        async function (snapshot) {
            //only reads once
            var student = snapshot.val();

            //student doesn't have a team
            if (student === null) {
                return res.json({
                    success: true,
                    message: "This student doesn't have a team",
                    hasTeam: false,
                    teamMembers: {},
                    studentFreedom: freedom,
                });
            } else {
                let teamName = student.team;
                let id = student.id;

                //student id's don't match
                if (id != studentId) {
                    return res.json({
                        success: false,
                        message:
                            "You aren't authorized to access this student's info",
                    });
                }

                //gets all of the names in the student's team
                var ref = db.ref(
                    'Games/' +
                    gameCode +
                    '/teams/' +
                    String(teamName) +
                    '/allStudents',
                );

                ref.once(
                    'value',
                    async function (snapshot) {
                        //only reads once
                        var teamData = snapshot.val();

                        var studentNames = [];

                        if (teamData) {
                            //add only the student names
                            for (var key of Object.keys(teamData)) {
                                studentNames.push(teamData[key]['name']);
                            }
                        }

                        return res.json({
                            success: true,
                            message: "Here is the student's teams data",
                            hasTeam: true,
                            teamName: teamName,
                            teamMembers: studentNames,
                            studentFreedom: freedom,
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
 * Removes a student from a team based on the team name and student name
 */

router.delete(
    '/delete',
    auth.checkGameCode,
    auth.validateBody,
    async function (req, res) {
        let gameCode = req.headers['game'];

        var studentName = req.body.studentName; //student name
        var studentId = req.body.studentId;
        var previousTeam = req.body.previousTeam; //team name

        if (studentName === undefined || previousTeam === undefined) {
            return res.json({
                success: false,
                message: 'Improper request',
            });
        }

        //check if the game has started yet

        //check freedom

        var studentFreedom = await helper.checkFreedom(gameCode);

        if (studentFreedom.freedom <= 1) {
            return res.json({
                success: false,
                message: "This game doesn't allow students to leave teams.",
            });
        }

        var db = admin.database();

        var ref = db.ref(
            'Games/' + gameCode + '/teams/' + previousTeam + '/allStudents',
        );

        //checks if the team exists
        ref.once(
            'value',
            async function (snapshot) {
                //only reads once
                var teamStudents = snapshot.val();

                if (teamStudents === null) {
                    return res.json({
                        success: false,
                        message: "This team doesn't exist",
                    });
                } else {
                    //now, we have to read all of the student names into an array, remove the
                    //student name that matches the student being deleted's student name, and then update
                    //it in the firebase database

                    var newStudents = [];

                    for (var key of Object.keys(teamStudents)) {
                        let currStudent = teamStudents[key];

                        //we found our student being deleted - don't push him/her to the array
                        if (currStudent['name'] === studentName) {
                            continue;
                        }

                        newStudents.push(currStudent); //pushes all of the students
                    }

                    //remove the student being deleted from the second spot
                    db.ref(
                        'Games/' + gameCode + '/students/' + studentName,
                    ).remove();

                    var data = await helper.checkFreedom(gameCode);

                    if (
                        newStudents.length === 0 &&
                        parseInt(data.freedom) === 3
                    ) {
                        //delete team if there are no more names left, but only if the game is the highest level of freedom
                        db.ref(
                            'Games/' + gameCode + '/teams/' + previousTeam,
                        ).remove();
                        db.ref(
                            'Games/' + gameCode + '/totalteams/' + previousTeam,
                        ).remove();

                        //decrease number of
                        db.ref(
                            'Games/' + gameCode + '/settings/public/numTeams',
                        )
                            .transaction(function (current_value) {
                                var c = current_value || 0;
                                c = parseInt(c);
                                if (c > 0) return current_value - 1;
                                return 0;
                            })
                            .then((result) => {
                                //change score visibility

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
                                            if (
                                                previousScoreVisibility >
                                                numTeams
                                            ) {
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
                                            message:
                                                'You have been removed from ' +
                                                previousTeam +
                                                '. This team has also been deleted.',
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
                    } else {
                        //update team with new names
                        db.ref(
                            'Games/' +
                            gameCode +
                            '/teams/' +
                            previousTeam +
                            '/allStudents',
                        ).set(newStudents);
                        return res.json({
                            success: true,
                            message:
                                'You have been removed from ' +
                                previousTeam +
                                '.',
                        });
                    }
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
    },
);

/**
 * Changes a student's team (new team can be a team created by the student or a team that already exists)
 */

router.post('/update', auth.checkGameCode, async function (req, res) {
    let gameCode = req.headers['game'];

    var studentName = req.body.studentName;
    var studentId = req.body.studentId;
    var newTeamName = req.body.newTeam; //new team name
    var isNew = req.body.isNew; //True if the student created a team

    if (
        studentName === undefined ||
        newTeamName === undefined ||
        isNew === undefined ||
        studentId === undefined
    ) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    //checks for bad characters
    if (!helper.checkTeamName(newTeamName) || !helper.checkName(studentName)) {
        return res.json({
            success: false,
            message:
                'Your team name and/or student name has improper characters. For example, it may be just a number. Please enter a new team name.',
        });
    }

    let onTeam = await helper.checkStudentOnTeam(studentName, newTeamName);

    if (onTeam) {
        //student is already on a team and cannot join another team
        return res.json({
            success: false,
            message: 'You are already on a team!',
        });
    }

    //new team being created
    if (isNew) {
        var studentFreedom = await helper.checkFreedom(gameCode);

        if (studentFreedom.freedom <= 2) {
            return res.json({
                success: false,
                message: "This game doesn't allow students to create teams.",
            });
        }

        var newTeam = {
            name: newTeamName,
            allStudents: [{ name: studentName, id: studentId }],
        };

        var db = admin.database();
        var ref = db.ref('Games/' + gameCode + '/totalteams/' + newTeam.name);

        //checks if the team already exists
        ref.once(
            'value',
            function (snapshot) {
                //only reads once
                var data = snapshot.val();

                if (data === true) {
                    //team already exists
                    return res.json({
                        success: false,
                        message:
                            'A team with the same name has already been created. Please choose another name.',
                    });
                }

                //add new team
                db.ref('Games/' + gameCode + '/teams/' + newTeam.name).set({
                    totalGuesses: 0,
                    allStudents: newTeam.allStudents,
                });

                //increment number of teams
                db.ref('Games/' + gameCode + '/settings/public/numTeams')
                    .transaction(function (current_value) {
                        var c = current_value || 0;
                        c = parseInt(c);
                        return c + 1;
                    })
                    .then((result) => {
                        //add in second spot to preserve O(1) time
                        db.ref(
                            'Games/' + gameCode + '/totalteams/' + newTeam.name,
                        ).set(true);

                        //adds each of the new student names that are a part of the team to its second spot to preserve O(1) time
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
                                    message:
                                        newTeam.name +
                                        ' has been created and you have been added to it.',
                                });
                            },
                            function (errorObject) {
                                console.log(
                                    'The read failed: ' + errorObject.code,
                                );
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
                return res.json({
                    success: false,
                    message: errorObject.message,
                });
            },
        );
    } else {
        //adding to team that already

        var studentFreedom = await helper.checkFreedom(gameCode);

        if (studentFreedom.freedom <= 1) {
            return res.json({
                success: false,
                message: "This game doesn't allow students to join teams.",
            });
        }

        //make sure this team is real

        var db = admin.database();

        var ref = db.ref('Games/' + gameCode + '/totalteams/' + newTeamName);

        ref.once(
            'value',
            function (snapshot) {
                var data = snapshot.val();

                if (data === null) {
                    return res.json({
                        success: false,
                        message: "This team doesn't exist",
                    });
                } else {
                    ref = db.ref(
                        'Games/' +
                        gameCode +
                        '/teams/' +
                        newTeamName +
                        '/allStudents',
                    );

                    ref.once('value', async function (snapshot) {
                        //only reads once
                        var teamStudents = snapshot.val();

                        var newStudents = [];

                        //this team has other users signed up
                        if (teamStudents) {
                            //Reads all of the student names that are a part of the team, appends the student's student name to an array
                            //And then updates it in firebase database

                            for (var key of Object.keys(teamStudents)) {
                                newStudents.push(teamStudents[key]); //push all of the student names
                            }
                        }

                        //before we add the student, we must check to see if the team has too many people

                        var maxPerTeam = await helper.getMaxPerTeam(gameCode);
                        maxPerTeam = maxPerTeam.max;

                        if (newStudents.length >= parseInt(maxPerTeam)) {
                            //too many people on the team
                            return res.json({
                                success: false,
                                message:
                                    'There are too many people on the team ' +
                                    newTeamName +
                                    '. Please contact a teacher if this is a mistake.',
                            });
                        }

                        //adds new user

                        newStudents.push({
                            name: studentName,
                            id: studentId,
                        });

                        //update in other spot and update team student names

                        db.ref(
                            'Games/' + gameCode + '/students/' + studentName,
                        ).set({
                            team: newTeamName,
                            id: studentId,
                        });

                        db.ref(
                            'Games/' +
                            gameCode +
                            '/teams/' +
                            newTeamName +
                            '/allStudents',
                        ).set(newStudents);

                        return res.json({
                            success: true,
                            message: 'You have been added to ' + newTeamName,
                        });
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
    }
});

router.post('/updateStudentId', auth.checkGameCode, async function (req, res) {
    let gameCode = req.headers['game'];

    var studentName = req.body.studentName;
    var studentId = req.body.studentId;
    var teamName = req.body.newTeam; //new team name

    if (
        studentName === undefined ||
        teamName === undefined ||
        studentId === undefined
    ) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    var db = admin.database();

    //first, update in the second spot outside of allStudents

    db.ref('Games/' + gameCode + '/students/' + studentName + '/id').set(
        studentId,
    );

    //second, update in teams location

    let ref = db.ref(
        'Games/' + gameCode + '/teams/' + teamName + '/allStudents',
    );

    ref.once('value', async function (snapshot) {
        //only reads once
        var allStudents = snapshot.val();

        for (var index in Object.keys(allStudents)) {
            //we found the index at which the id is stored a second time
            if (allStudents[index]['name'] === studentName) {
                db.ref(
                    'Games/' +
                    gameCode +
                    '/teams/' +
                    teamName +
                    '/allStudents/' +
                    index +
                    '/id',
                ).set(studentId);
                break;
            }
        }

        return res.json({
            success: true,
            message: 'Updated id',
        });
    });
});

module.exports = router;
