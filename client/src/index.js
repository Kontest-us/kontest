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
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
});

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root'),
);
