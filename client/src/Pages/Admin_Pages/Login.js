import React, { Component } from 'react';
import '../../style/index.css';
import '../../style/account.css';
import '../../style/buttons.css';
import { Link } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth';
import swal from 'sweetalert';

var MIN_SCREEN = 700;

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.login = this.login.bind(this);
        this.googleLogin = this.googleLogin.bind(this);
        this.loginUser = this.loginUser.bind(this);

        this.state = {
            email: '',
            password: '',
            success: true,
            message: '',
        };
    }

    componentDidMount() {
        if (window.innerWidth <= MIN_SCREEN) {
            swal(
                'Warning: your screen is a bit too small. As a result, some of our features may be off your screen or not properly work. We recommend that you try this on a computer or tablet.',
                '',
                'warning',
            );
        }
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    googleLogin() {
        firebase
            .auth()
            .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                // Existing and future Auth states are now persisted in the current
                // session only. Closing the window would clear any existing state even
                // if a user forgets to sign out.
                // ...
                // New sign-in will be persisted with session persistence.

                //login user using google

                var provider = new firebase.auth.GoogleAuthProvider();

                firebase
                    .auth()
                    .signInWithPopup(provider)
                    .then((result) => {
                        // This gives you a Google Access Token. You can use it to access the Google API.
                        var token = result.credential.accessToken;

                        // ...
                        localStorage.setItem(
                            'displayName',
                            result.user.displayName,
                        );
                    })
                    .catch((error) => {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // The email of the user's account used.
                        var email = error.email;
                        // The firebase.auth.AuthCredential type that was used.
                        var credential = error.credential;
                        // ...
                        console.log(errorMessage);

                        this.state['message'] =
                            'Error logging in. Please refresh the page and try again.';
                        this.state['success'] = false;
                        this.setState(this.state);

                        setTimeout(() => {
                            this.state['message'] = '';
                            this.state['success'] = false;
                            this.setState(this.state);
                        }, 5000);
                    });
            })
            .catch((error) => {
                // Handle error
                this.state['message'] =
                    'Error logging in. Please refresh the page and try again.';
                this.state['success'] = false;
                this.setState(this.state);

                setTimeout(() => {
                    this.state['message'] = '';
                    this.state['success'] = false;
                    this.setState(this.state);
                }, 5000);
            });
    }

    loginUser(email, password) {
        firebase
            .auth()
            .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                // Existing and future Auth states are now persisted in the current
                // session only. Closing the window would clear any existing state even
                // if a user forgets to sign out.
                // ...
                // New sign-in will be persisted with session persistence.

                //login user
                firebase
                    .auth()
                    .signInWithEmailAndPassword(email, password)
                    .then((result) => {
                        localStorage.setItem(
                            'displayName',
                            result.user.displayName,
                        );
                        //logged in, will be automatically routed in App.js
                    })
                    .catch((error) => {
                        // Handle Errors here.

                        this.state['message'] = error.message;
                        this.state['success'] = false;
                        this.setState(this.state);

                        setTimeout(() => {
                            this.state['message'] = '';
                            this.state['success'] = false;
                            this.setState(this.state);
                        }, 5000);
                    });
            })
            .catch((error) => {
                // Handle error
                this.state['message'] =
                    'Error logging in. Please refresh the page and try again.';
                this.state['success'] = false;
                this.setState(this.state);

                setTimeout(() => {
                    this.state['message'] = '';
                    this.state['success'] = false;
                    this.setState(this.state);
                }, 5000);
            });
    }

    login() {
        var email = this.state.email;
        var password = this.state.password;

        if (email === '' || password === '') {
            this.state['message'] = 'Please fill in all of the fields.';
            this.state['success'] = false;
            this.setState(this.state);

            setTimeout(() => {
                this.state['message'] = '';
                this.state['success'] = false;
                this.setState(this.state);
            }, 5000);

            return;
        }

        this.loginUser(email, password);
    }

    render() {
        let errorBox = null;

        var color = '#e11444';
        if (this.state.success) {
            color = 'green';
        }

        if (this.state.message != '') {
            let errorBoxStyle = {
                position: 'fixed',
                width: '90%',
                margin: 'auto',
                backgroundColor: color,
                color: 'white',
                fontSize: '20px',
                textAlign: 'center',
                top: '20px',
                padding: '10px',
                boxSizing: 'border-box',
                borderRadius: '8px',
                zIndex: '20',
            };
            errorBox = <div style={errorBoxStyle}>{this.state.message}</div>;
        }

        return (
            <div className={'App'}>
                {errorBox}

                <div className="auth-wrapper">
                    <div className="auth-inner">
                        <h3
                            style={{
                                fontSize: '35px',
                                fontWeight: 'bold',
                                color: '#073b4c',
                            }}
                        >
                            Teacher Log In
                        </h3>

                        <div className="form-group">
                            <label style={{ color: '#073b4c' }}>
                                Email address
                            </label>
                            <input
                                style={{ color: '#073b4c' }}
                                type="email"
                                className="form-control"
                                name="email"
                                value={this.state.email}
                                placeholder="Enter email"
                                onChange={this.valueChanged}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#073b4c' }}>Password</label>
                            <input
                                style={{ color: '#073b4c' }}
                                type="password"
                                className="form-control"
                                name="password"
                                value={this.state.password}
                                placeholder="Enter password"
                                onChange={this.valueChanged}
                            />
                        </div>

                        <button className="dark-green-btn" onClick={this.login}>
                            Sign In
                        </button>
                        <br></br>
                        <br></br>

                        <Link to={'/'}>
                            <button className="red-btn">Home</button>
                        </Link>
                        <br></br>

                        <br></br>

                        <Link
                            to={'/admin/signup'}
                            style={{
                                color: '#118AB2',
                                textDecoration: 'underline',
                            }}
                        >
                            <p className="forgot-password text-right">
                                Need an account?
                            </p>
                        </Link>

                        <Link
                            to={'/admin/reset'}
                            style={{
                                color: '#118AB2',
                                textDecoration: 'underline',
                            }}
                        >
                            <p className="forgot-password text-right">
                                Forgot your password?
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
