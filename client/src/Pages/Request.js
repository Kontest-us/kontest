import firebase from 'firebase/app';
import 'firebase/auth';

export var url = 'http://localhost:8000/';

//https://estimathon.herokuapp.com/
//"https://api.kontest.us/"
//http://localhost:8000/
//http://192.168.0.22:3000/

export function regularRequest(handler, method, body, callback) {
    const http = new XMLHttpRequest();
    http.responseType = 'json';

    http.open(method, url + handler, true);

    if (body != null) {
        http.setRequestHeader('Content-Type', 'application/json');
    }
    http.onload = function () {
        callback(http.response);
    };

    http.send(JSON.stringify(body));
}

export function studentRequest(handler, method, gameCode, body, callback) {
    const http = new XMLHttpRequest();
    http.responseType = 'json';

    http.open(method, url + handler, true);
    http.setRequestHeader('Game', gameCode); // gamecode passed in

    if (body != null) {
        http.setRequestHeader('Content-Type', 'application/json');
    }
    http.onload = function () {
        callback(http.response);
    };

    http.send(JSON.stringify(body));
}

export function adminRequest(handler, method, body, callback) {
    const http = new XMLHttpRequest();
    http.responseType = 'json';

    http.open(method, url + handler, true);

    firebase
        .auth()
        .currentUser.getIdToken(/* forceRefresh */ true)
        .then((idToken) => {
            //save this token to local storage
            http.setRequestHeader('Authorization', idToken);

            if (body != null) {
                http.setRequestHeader('Content-Type', 'application/json');
            }
            http.onload = function () {
                callback(http.response);
            };

            http.send(JSON.stringify(body));
        })
        .catch((error) => {
            callback('Auth Error');
        });
}

export function adminGameRequest(handler, method, gameCode, body, callback) {
    const http = new XMLHttpRequest();
    http.responseType = 'json';

    http.open(method, url + handler, true);
    http.setRequestHeader('Game', gameCode); // gamecode passed in

    firebase
        .auth()
        .currentUser.getIdToken(/* forceRefresh */ true)
        .then((idToken) => {
            //save this token to local storage
            http.setRequestHeader('Authorization', idToken);

            if (body != null) {
                http.setRequestHeader('Content-Type', 'application/json');
            }
            http.onload = function () {
                callback(http.response);
            };

            http.send(JSON.stringify(body));
        })
        .catch((error) => {
            callback('Auth Error');
        });
}
