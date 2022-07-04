var helper = require('./helper');

/**
 * Middleware for checking if a a user should be able to access a specific game's data
 */

var admin = require('firebase-admin');

/* There are three admin levels:

Admin (0) - can edit questions, teams, and game time; also add other admins
Writer (1) - can edit the questions, and game settings
Reader (2) - can only view questions and game settings (with only option to duplicate)
Public Reader (3) - can do above, but only if the game is public
*/

async function level0(req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization']; //gets the token
    let gameCode = req.headers['game'];

    let tokenResponse = await verifyAdmin(token, gameCode, 0);

    if (tokenResponse.success) {
        req.uid = tokenResponse.uid;
        req.status = tokenResponse.status;
        next();
    } else {
        return res.json({
            success: false,
            message: tokenResponse.message,
        });
    }
}

async function level1(req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization']; //gets the token
    let gameCode = req.headers['game'];

    let tokenResponse = await verifyAdmin(token, gameCode, 1);

    if (tokenResponse.success) {
        req.uid = tokenResponse.uid;
        req.status = tokenResponse.status;
        next();
    } else {
        return res.json({
            success: false,
            message: tokenResponse.message,
        });
    }
}

async function level2(req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization']; //gets the token
    let gameCode = req.headers['game'];

    let tokenResponse = await verifyAdmin(token, gameCode, 2);
    if (tokenResponse.success) {
        req.uid = tokenResponse.uid;
        req.status = tokenResponse.status;
        next();
    } else {
        return res.json({
            success: false,
            message: tokenResponse.message,
        });
    }
}

async function level3(req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization']; //gets the token
    let gameCode = req.headers['game'];

    let tokenResponse = await verifyAdmin(token, gameCode, 3);
    if (tokenResponse.success) {
        req.uid = tokenResponse.uid;
        req.status = tokenResponse.status;
        next();
    } else {
        return res.json({
            success: false,
            message: tokenResponse.message,
        });
    }
}

function verifyAdmin(token, gameCode, requiredLevel) {
    return new Promise((resolve) => {
        //asynchronous method

        if (gameCode === undefined) {
            resolve({ success: false, message: 'Please enter a game code!' });
        }

        if (token) {
            if (token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }

            //first, verify if actual user
            admin
                .auth()
                .verifyIdToken(token)
                .then(function (decodedToken) {
                    let uid = decodedToken.uid;

                    //now we check if they belong to the game
                    var db = admin.database();
                    var ref = db.ref('Games/' + gameCode + '/admins/' + uid);

                    ref.once('value', async function (snapshot) {
                        var data = snapshot.val();

                        if (data != null) {
                            //Admin belongs to game, but level may be too low
                            let adminLevel = data.status;

                            //The smaller your level, the more perms you have.
                            if (
                                adminLevel != null &&
                                adminLevel <= requiredLevel
                            ) {
                                resolve({
                                    success: true,
                                    message: 'Approved',
                                    uid: uid,
                                    status: adminLevel,
                                });
                            } else {
                                //Cannot do this because their perm level is too high
                                resolve({
                                    success: false,
                                    message:
                                        'You do not have the permission to do this.',
                                });
                            }
                        } else {
                            //The admin doesn't belong to this game. However, the game may be public.
                            //If it is public, then we give the admin a default level of 3 and then check if their level works.

                            let isPublicResponse = await helper.checkPublic(
                                gameCode,
                            );

                            if (isPublicResponse.isPublic) {
                                let adminLevel = 3;

                                //The smaller your level, the more perms you have.
                                if (adminLevel <= requiredLevel) {
                                    resolve({
                                        success: true,
                                        message: 'Approved',
                                        uid: uid,
                                        status: adminLevel,
                                    });
                                } else {
                                    //Cannot do this because their perm level is too high
                                    resolve({
                                        success: false,
                                        message:
                                            'You do not have the permission to do this.',
                                    });
                                }
                            } else {
                                //bad user
                                resolve({
                                    success: false,
                                    message: 'You do not belong to this game!',
                                });
                            }
                        }
                    }).catch(function (error) {
                        var errorMessage = error.message;
                        console.log(errorMessage);
                        resolve({ success: false, message: errorMessage });
                    });
                })
                .catch(function (error) {
                    console.log(error.message);
                    // bad uid
                    resolve({
                        success: false,
                        message: 'Unauthorized user',
                    });
                });
        } else {
            //didn't provide an auth token
            resolve({
                success: false,
                message: 'Auth Token Not Provided',
            });
        }
    });
}

let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; //gets the token
    let gameCode = req.headers['game'];

    if (gameCode === undefined) {
        return res.json({
            success: false,
            message: 'Please enter a game code!',
        });
    }

    if (token) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        //first, verify if actual user
        admin
            .auth()
            .verifyIdToken(token)
            .then(function (decodedToken) {
                let uid = decodedToken.uid;

                req.uid = uid;

                //now we check if they belong to the game
                var db = admin.database();
                var ref = db.ref('Games/' + gameCode + '/admins/' + uid);

                ref.once('value', function (snapshot) {
                    var data = snapshot.val();

                    if (data != null) {
                        //good user
                        next();
                    } else {
                        //bad user
                        return res.json({
                            success: false,
                            message: 'You do not belong to this game!',
                        });
                    }
                }).catch(function (error) {
                    var errorMessage = error.message;
                    return res.json({ success: false, message: errorMessage });
                });
            })
            .catch(function (error) {
                // bad uid
                return res.json({
                    success: false,
                    message: 'Unauthorized user',
                });
            });
    } else {
        //didn't provide an auth token
        return res.json({
            success: false,
            message: 'Auth Token Not Provided',
        });
    }
};

//still an admin middleware, except the client doesn't send a game code. Instead, this function just decodes the
//admin token into a firebase uid

let getToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; //gets the token

    if (token) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        //first, verify if actual user
        admin
            .auth()
            .verifyIdToken(token)
            .then(function (decodedToken) {
                let uid = decodedToken.uid;
                req.uid = uid;

                next();
            });
    } else {
        //didn't provide an auth token
        return res.json({
            success: false,
            message: 'Auth Token Not Provided',
        });
    }
};

let checkGameCode = (req, res, next) => {
    let gameCode = req.headers['game'] || undefined;

    //return "error" if the game code/uid is not defined
    if (gameCode === undefined || typeof gameCode != 'string') {
        return res.json({
            success: false,
            message: 'You need to pass in a gameCode',
        });

        //check if game exists
    } else {
        var db = admin.database();

        var ref = db.ref('TotalGames/' + gameCode);

        //checks if a team with the new team's name already exists
        ref.once(
            'value',
            function (snapshot) {
                //only reads once
                var data = snapshot.val();

                if (data === null) {
                    return res.json({
                        success: false,
                        message: "The gameCode you passed in doesn't exist",
                    });
                }

                next();
            },
            function (errorObject) {
                //error, return true
                return res.json({
                    success: false,
                    message: 'Error, please try again!',
                });
            },
        );
    }
};

let validateBody = (req, res, next) => {
    let body = req.body;

    if (body) {
        for (var key of Object.keys(body)) {
            //skip data that has the key "email" - it will probably contain @ or .
            if (key.toLowerCase().includes('email')) {
                continue;
            }

            let data = body[key];

            if (typeof data === 'string') {
                if (!helper.checkName(data)) {
                    return res.json({
                        success: false,
                        message:
                            'Please do not enter empty strings or strings with bad characters, like ., $, #, [, and ]!',
                    });
                }
            }
        }

        //no bad strings so we can continue
        next();
    } else {
        return res.json({
            success: false,
            message: "You don't have a body!",
        });
    }
};

module.exports = {
    level0: level0,
    level1: level1,
    level2: level2,
    level3: level3,
    checkToken: checkToken,
    getToken: getToken,
    checkGameCode: checkGameCode,
    validateBody: validateBody,
};
