/* Dependencies */

const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const http = require('http').createServer(app);
const questions = require('./src/routes/questions');
const teams = require('./src/routes/teams');
const adminRouter = require('./src/routes/admin');
const students = require('./src/routes/students');
const game = require('./src/routes/game');
const helper = require('./src/utils/helper');

// CORS options

const corsOptions = {
    origin: [
        'http://localhost:3001',
        'http://192.168.0.32:3000',
        'http://192.168.0.32:3001',
        'https://kontest.us',
        'http://localhost:3000',
        'http://localhost:8000',
    ],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    // methods: ["GET", "POST", "DELETE"] //methods allowed
};

const io = require('socket.io')(http, {
    cors: corsOptions,
});

// import socket

require('dotenv').config();

/* Firebase Initialization - only happens once in the root file */

const serviceAccount = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
    client_x509_cert_url: process.env.CLIENT_CERT_URL,
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://estimathon-f4ead.firebaseio.com',
    storageBucket: 'gs://estimathon-f4ead.appspot.com',
});

/* Express Settings */

app.use(cors(corsOptions)); // using cors

app.use(
    bodyParser.urlencoded({
        // Middleware
        extended: true,
    }),
);

app.get("/", function (req, res) {
    res.send("Working")
})

app.use(bodyParser.json());

//Questions
app.use('/questions', questions)

//Teams
app.use('/teams', teams)

//Admin
app.use('/admin', adminRouter)

//game
app.use('/game', game)

//students
app.use('/students', students)

/*
This socket.io method for updating the scores for a game relies on storing the current games going on and creating/detaching firebase listeners everytime
a new student requests to monitor the game.
*/

//A dictionary that contains all of the games that are currently in play.

//Each node contains the number of players monitoring the score and the firebase listener callback
var games = {};

io.on('connection', (socket) => {

    var db = admin.database();

    //a connection has been made

    socket.on('initialScore', (gameCode, teamName, isAdmin) => {

        var rooms = Array.from(socket.rooms);

        var userRoom = rooms[0];

        var ref = db.ref("Games/" + gameCode + "/teams");

        //however, we should send the current scores to this player
        ref.once("value", function (snapshot) {



            var teamData = {}

            // conditional for sending team data to admin when value is null
            if (snapshot.val()) {
                teamData = snapshot.val(); //change to the score/team has been made

                for (var tempTeamName in teamData) {
                    if (teamData[tempTeamName].hasOwnProperty('totalGuesses')) {
                        delete teamData[tempTeamName]['totalGuesses']

                    }

                    if (teamData[tempTeamName].hasOwnProperty('ans')) {
                        delete teamData[tempTeamName]['ans']
                    }

                    if (teamData[tempTeamName].hasOwnProperty('points')) {
                        delete teamData[tempTeamName]['points']
                    }

                    if (teamData[tempTeamName].hasOwnProperty('allStudents')) {

                        for (var i = 0; i < teamData[tempTeamName]['allStudents'].length; i++) {
                            if (teamData[tempTeamName]['allStudents'][i].hasOwnProperty('id')) {

                                delete teamData[tempTeamName]['allStudents'][i]['id']

                            }

                        }

                    }

                }


            }



            io.to(userRoom).emit("teams", teamData);

            // sets teamData back to original value
            teamData = snapshot.val()

            //before we send an updated scoreboard, we need to get the number of questions for this game
            //before we start the listener, we must get the number of questions for this game
            let ref = db.ref("Games/" + gameCode + "/settings/public");
            ref.once("value", async function (data) {

                if (data === null) { //bad game code
                    return;
                }


                var gameSettings = data.val();


                var numQuestions = parseInt(gameSettings.numQuestions || 0);
                var scoreVisibility = parseInt(gameSettings.scoreVisibility['num'])

                let questionData = await helper.getQuestionMult(gameCode);

                //get the table
                var allTableData = helper.getTable(questionData, numQuestions, teamData);

                // get all answers to deliver to admin


                let table = allTableData.table;
                let isEstimathon = allTableData.isEstimathon;

                if (isEstimathon) {
                    //Team with less points wins
                    table.sort((a, b) => {

                        if (parseFloat(a.totalScore) > parseFloat(b.totalScore)) {
                            return 1
                        } else if (parseFloat(a.totalScore) === parseFloat(b.totalScore)) { //if the same number of points, then rank by number of guesses
                            return parseFloat(a.totalGuesses) > parseFloat(b.totalGuesses) ? 1 : -1; //less guesses, higher rank
                        }
                        return -1;
                    })
                } else {
                    //Team with more points wins
                    table.sort((a, b) => {

                        if (parseFloat(a.totalScore) < parseFloat(b.totalScore)) {
                            return 1
                        } else if (parseFloat(a.totalScore) === parseFloat(b.totalScore)) { //if the same number of points, then rank by number of guesses
                            return parseFloat(a.totalGuesses) > parseFloat(b.totalGuesses) ? 1 : -1; //less guesses, higher rank
                        }
                        return -1;
                    })
                }

                var studentTable = table.filter((table, index) => index < scoreVisibility)
                var singleTable = []
                var place = 0;
                for (var i = 0; i < table.length; i++) {
                    if (table[i]['teamName'] === teamName) {
                        singleTable = table[i]
                        place = table.indexOf(table[i]) + 1

                        break;
                    }
                }

                // same logic as in JoinGame, if admin, send whole scoreboard
                if (isAdmin) {
                    io.to(userRoom).emit("scoreTable", { table: table, isEstimathon: isEstimathon });


                } else {

                    // if the connection is from a student, send top n scores and the student's team data
                    io.to(userRoom).emit("scoreTable", { table: studentTable, isEstimathon: isEstimathon });
                    io.to(userRoom).emit("singleTeamTable", singleTable);
                    io.to(userRoom).emit("place", place);
                }

            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
                //remove listener
                ref.off("value", listener);
                delete games[gameCode];
            });




        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
            //remove listener
            ref.off("value", listener);
            delete games[gameCode];
        });







    });

    //a client wants to monitor a game's score in game.js, or the team status in student.js
    socket.on('joinGame', (gameCode, teamName, isAdmin) => {

        //join a room
        socket.join(gameCode);

        //IMPORTANT: DO NOT CHANGE THIS ORDER

        if (isAdmin) {
            socket.join("admin/" + gameCode)
        } else {
            socket.join("student/" + gameCode)
            socket.join(gameCode + "/" + teamName)
        }

        //add the student to his/her game
        if (!games.hasOwnProperty(gameCode)) {
            //first time, must create a listener as well
            games[gameCode] = { players: 1 };

            let uid = gameCode; //save uid;
            var ref = db.ref("Games/" + gameCode + "/teams");

            var listener = ref.on("value", function (snapshot) {

                var teamData = {}
                // conditional for sending team data to admin when value is null
                if (snapshot.val()) {
                    teamData = snapshot.val(); //change to the score/team has been made

                    for (var teamName in teamData) {

                        //delete if equal to null - happens in the scenario that the team name is a number, which shouldn't happen after 5/19/2021.
                        if (teamData[teamName] === null) {
                            delete teamData[teamName]
                            continue;
                        }


                        if (teamData[teamName].hasOwnProperty('totalGuesses')) {
                            delete teamData[teamName]['totalGuesses']

                        }

                        if (teamData[teamName].hasOwnProperty('ans')) {
                            delete teamData[teamName]['ans']
                        }

                        if (teamData[teamName].hasOwnProperty('points')) {
                            delete teamData[teamName]['points']
                        }

                        if (teamData[teamName].hasOwnProperty('allStudents')) {

                            for (var i = 0; i < teamData[teamName]['allStudents'].length; i++) {
                                if (teamData[teamName]['allStudents'][i].hasOwnProperty('id')) {

                                    delete teamData[teamName]['allStudents'][i]['id']

                                }

                            }

                        }

                    }
                }
                // sent to team formations for students only
                io.to("student/" + uid).emit("teams", teamData);

                // sent to team formations for admins only
                io.to("admin/" + uid).emit("teams", teamData);

                teamData = snapshot.val()



                //before we send an updated scoreboard, we need to get the number of questions for this game
                //before we start the listener, we must get the number of questions for this game
                let ref = db.ref("Games/" + gameCode + "/settings/public");
                ref.once("value", async function (data) {

                    var gameSettings = data.val();

                    var numQuestions = parseInt(gameSettings.numQuestions);
                    var scoreVisibility = parseInt(gameSettings.scoreVisibility['num'])

                    let questionData = await helper.getQuestionMult(gameCode);

                    //get the table
                    var tableData = helper.getTable(questionData, numQuestions, teamData);

                    var table = tableData.table;
                    var isEstimathon = tableData.isEstimathon;

                    if (isEstimathon) {
                        //Team with less points wins
                        table.sort((a, b) => {

                            if (parseFloat(a.totalScore) > parseFloat(b.totalScore)) {
                                return 1
                            } else if (parseFloat(a.totalScore) === parseFloat(b.totalScore)) { //if the same number of points, then rank by number of guesses
                                return parseFloat(a.totalGuesses) > parseFloat(b.totalGuesses) ? 1 : -1; //less guesses, higher rank
                            }
                            return -1;
                        })
                    } else {
                        //Team with more points wins
                        table.sort((a, b) => {
                            if (parseFloat(a.totalScore) < parseFloat(b.totalScore)) {
                                return 1
                            } else if (parseFloat(a.totalScore) === parseFloat(b.totalScore)) { //if the same number of points, then rank by number of guesses
                                return parseFloat(a.totalGuesses) > parseFloat(b.totalGuesses) ? 1 : -1; //less guesses, higher rank
                            }
                            return -1;
                        })
                    }



                    // filter only the top n teams based on scoreVisibility
                    var studentTable = table.filter((table, index) => index < scoreVisibility)

                    //now we send each individual team their table
                    for (var i = 0; i < table.length; i++) {

                        let currentTeamName = String(table[i]["teamName"]);
                        let singleTable = table[i];
                        io.to(gameCode + "/" + currentTeamName).emit('singleTeamTable', singleTable)
                        let place = table.indexOf(table[i]) + 1
                        io.to(gameCode + "/" + currentTeamName).emit('place', place)
                    }

                    //emit to all of the students in the room
                    io.to("student/" + uid).emit("scoreTable", { table: studentTable, isEstimathon: isEstimathon });

                    //emit to all of the admins in the room
                    io.to("admin/" + uid).emit("scoreTable", { table: table, isEstimathon: isEstimathon });


                }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                    //remove listener
                    ref.off("value", listener);
                    delete games[gameCode];
                });






            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
                //remove listener
                ref.off("value", listener);
                delete games[gameCode];
            });

            games[gameCode]["listener"] = listener; //set listener in dictionary

        } else {
            //no need to create listener
            games[gameCode]["players"] += 1;

        }


    });

    socket.on('sendMessage', (gameCode, message) => {

        io.to("student/" + gameCode).emit("notification", message);
    });

    socket.on('sendAnswers', (gameCode, showOrNot) => {

        io.to("student/" + gameCode).emit("getAnswers", showOrNot);

    });



    //student is disconnecting
    socket.on('disconnecting', () => {
        var rooms = socket.rooms;

        //we must remove the kid from the games dictionary
        rooms.forEach(key => {
            if (games.hasOwnProperty(key)) {
                if (games[key]["players"] === 1) { //the student was the last kid in the room so we can delete the record itself

                    //first, detach the listener
                    var ref = db.ref("Games/" + key + "/teams"); //create the ref
                    var listener = games[key]["listener"];
                    //detatch listener
                    ref.off("value", listener);
                    // console.log("detatched listener")

                    delete games[key]; //delete
                } else {
                    games[key]["players"] -= 1; //one less kid watching
                }
            }
        })


    });

    socket.on('disconnect', () => {
        //disconnected user
        // console.log("disconnected")
    });

});

//Listener for the server
http.listen(process.env.PORT || 8000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

const socketIoObject = io;
module.exports.ioObject = socketIoObject;
