import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
import App from './App';
import firebase from 'firebase/app';

import './style/main.bundle.css';
import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch,
    BrowserRouter,
} from 'react-router-dom';

firebase.initializeApp({
    apiKey: 'AIzaSyCMwiPIVpb3N1HOAwup5lJj63wd7-rJsKE',
    authDomain: 'estimathon-f4ead.firebaseapp.com',
    databaseURL: 'https://estimathon-f4ead.firebaseio.com',
    projectId: 'estimathon-f4ead',
    storageBucket: 'estimathon-f4ead.appspot.com',
    messagingSenderId: '412275947215',
    appId: '1:412275947215:web:e51859e7ffb00b91f0a9ba',
    measurementId: 'G-65THYWN54T',
});

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root'),
);
