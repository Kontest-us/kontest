/* Dependencies */

const express = require('express');

const router = express.Router();
const admin = require('firebase-admin');
const helper = require('../utils/helper');
const auth = require('../utils/auth');

/**
 * Signup is done server-side in order to authorize the user
 */
router.post('/signup', function (req, res) {
    var db = admin.database();

    const email = req.body.email;
    const password = req.body.password;
    const displayName = req.body.displayName;

    const schoolName = req.body.schoolName;
    const classes = req.body.classes;
    const use = req.body.use;

    if (
        email === undefined ||
        password === undefined ||
        displayName === undefined
    ) {
        return res.json({
            success: false,
            message: 'Improper request',
        });
    }

    admin
        .auth()
        .createUser({
            email: email,
            emailVerified: true,
            password: password,
            displayName: displayName,
            disabled: false,
        })
        .then(function (userRecord) {
            let uid = userRecord.uid;

            //add the admin account info to firebase

            db.ref('Admins/' + uid + '/account').set({
                schoolName: schoolName,
                classes: classes,
                use: use,
                email: email,
                name: displayName,
            });

            return res.json({
                success: true,
                message: 'You have been signed up. Please go back and login.',
            });
        })
        .catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message; // this is where I am getting the error message from
            return res.json({ success: false, message: errorMessage });
        });
});

/**
 * Removes an admin from a game
 */

router.delete(
    '/removeFromGame',
    auth.level2,
    auth.checkGameCode,
    async function (req, res) {
        let gameCode = req.headers['game'];

        var uid = req.uid;

        var response = await helper.removeAdminFromGame(uid, gameCode);

        return res.json({
            success: response.success,
            message: response.message,
        });
    },
);

/**
 * Admin makes another admin leave a game
 */

router.delete(
    '/forcedRemoveFromGame',
    auth.level0,
    auth.checkGameCode,
    async function (req, res) {
        let gameCode = req.headers['game'];

        let removedEmail = req.body.email;

        //We already know this admin is the head.

        admin
            .auth()
            .getUserByEmail(removedEmail)
            .then(async function (userRecord) {
                // See the UserRecord reference doc for the contents of userRecord.
                let data = userRecord.toJSON();
                let removedUID = data.uid;

                var response = await helper.removeAdminFromGame(
                    removedUID,
                    gameCode,
                );

                return res.json({
                    success: response.success,
                    message: removedEmail + ' has been removed.',
                });
            })
            .catch((error) => {
                console.log('Error fetching user data:', error);
                return res.json({
                    success: false,
                    message: error.message,
                });
            });
    },
);

//get an admin account information
router.get('/getAdminInformation', auth.getToken, function (req, res) {
    var uid = req.uid;

    //get all of the admin's games

    var db = admin.database();
    var ref = db.ref('Admins/' + uid + '/account');

    ref.once('value', async function (snapshot) {
        var account = snapshot.val();

        res.json({
            success: true,
            message: 'Here is the account info',
            data: account,
        });
    }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        return res.json({ success: false, message: errorMessage });
    });
});

//update an admin account information
router.post('/updateAdminInformation', auth.getToken, function (req, res) {
    var uid = req.uid;

    var schoolName = req.body.schoolName;
    var classes = req.body.classes;
    var use = req.body.use;
    var email = req.body.email;
    var name = req.body.name;

    //get all of the admin's games

    var db = admin.database();
    db.ref('Admins/' + uid + '/account').set({
        schoolName: schoolName,
        classes: classes,
        use: use,
        email: email,
        name: name,
    });

    res.json({
        success: true,
        message: 'Updated account info',
    });
});

router.get(
    '/getAdminsInGame',
    auth.level2,
    auth.checkGameCode,
    async function (req, res) {
        var gameCode = req.headers.game;

        var allAdmins = await helper.getGameAdmins(gameCode);

        admins = [];

        let headAdmin = '';

        //allAdmins can't be null
        for (var key of Object.keys(allAdmins)) {
            if (key === 'head') {
                headAdmin = allAdmins[key];
                continue;
            }
            admins.push(allAdmins[key]);
        }

        return res.json({
            success: true,
            message: 'Here are the admins',
            admins: admins,
            head: allAdmins[headAdmin],
        });
    },
);

/**
 * Removes an admin's data in firebase
 */

router.delete('/deleteAccount', auth.getToken, function (req, res) {
    var uid = req.uid;

    //get all of the admin's games

    var db = admin.database();
    var ref = db.ref('Admins/' + uid + '/games');

    ref.once('value', async function (snapshot) {
        var allGames = snapshot.val();

        //remove the admin from each of its games

        //iterate through the JSON returned from the firebase query
        if (allGames != null) {
            for (var key in allGames) {
                if (allGames.hasOwnProperty(key)) {
                    await helper.removeAdminFromGame(uid, key); //remove the admin from this current game
                }
            }
        }

        //remove the game from the admin spot in firebase
        db.ref('Admins/' + uid).remove();

        return res.json({
            success: true,
            message: 'Removed admin from firebase',
        });
    }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        return res.json({ success: false, message: errorMessage });
    });
});

module.exports = router;
