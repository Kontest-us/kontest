import React, { Component } from 'react';
import '../../style/index.css';
import '../../style/buttons.css';
import '../../style/account.css';
import { Link } from 'react-router-dom';
import { regularRequest } from '../Request';
import CheckBox from './components/checkbox';
import swal from 'sweetalert';

import firebase from 'firebase/app';
import 'firebase/auth';

var MIN_SCREEN = 700;

export default class Register extends Component {
    constructor(props) {
        super(props);

        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.register = this.register.bind(this);
        this.loginUser = this.loginUser.bind(this);

        this.state = {
            name: '',
            email: '',
            schoolName: '',
            classes: '',
            password: '',
            password2: '',
            success: true,
            message: '',
            use: '',
            mathOrScience: true, // true means math --> this is not used anymore
            classesState: [
                { id: 1, value: 'Algebra 1', isChecked: false },
                { id: 2, value: 'Algebra 2', isChecked: false },
                { id: 2, value: 'Geometry', isChecked: false },
                { id: 3, value: 'Trigonometry', isChecked: false },
                { id: 4, value: 'Calculus AB', isChecked: false },
                { id: 5, value: 'Calculus BC', isChecked: false },
                { id: 6, value: 'Multivariable Calculus', isChecked: false },
                { id: 7, value: 'Statistics', isChecked: false },
                { id: 8, value: 'Other Math Class', isChecked: false },
                { id: 9, value: 'Biology', isChecked: false },
                { id: 10, value: 'Chemistry', isChecked: false },
                { id: 11, value: 'Physics', isChecked: false },
                { id: 12, value: 'Earth Science', isChecked: false },
                { id: 13, value: 'Astrology', isChecked: false },
                { id: 14, value: 'Computer Science', isChecked: false },
                { id: 15, value: 'Other Science Class', isChecked: false },
                { id: 16, value: 'English', isChecked: false },
                { id: 17, value: 'History', isChecked: false },
                { id: 18, value: 'Economics', isChecked: false },
                { id: 19, value: 'Government', isChecked: false },
                {
                    id: 20,
                    value: 'Other Social Science Class',
                    isChecked: false,
                },
                { id: 21, value: 'Business', isChecked: false },
                { id: 22, value: 'Other Class', isChecked: false },
            ],
            useState: [
                { id: 1, value: 'Quiz', isChecked: false },
                { id: 2, value: 'Test Review', isChecked: false },
                { id: 2, value: 'Math Team Contest', isChecked: false },
                { id: 3, value: 'In Class Contest', isChecked: false },
                { id: 4, value: 'Scholastic Bowl', isChecked: false },
                { id: 5, value: 'Estimathon', isChecked: false },
                { id: 6, value: 'Science Olympiad Contest', isChecked: false },
                { id: 7, value: 'Other Club', isChecked: false },
                { id: 8, value: 'Other Contest', isChecked: false },
            ],
            page: 0,
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
        if (e.target.name != 'mathorscience')
            this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        let message = '';

        if (key === 'page') {
            if (val === 1) {
                //make sure everything on page 1 is filled
                if (this.state.name === '') {
                    message = 'Please fill in all of the fields.';
                }
            } else if (val === 2) {
                //make sure everything on page 2 is filled
                if (this.state.schoolName === '') {
                    message = 'Please fill in all of the fields.';
                }
            }
        }

        if (message != '') {
            this.state['message'] = message;
            this.state['success'] = false;
            this.setState(this.state);

            setTimeout(() => {
                this.state['message'] = '';
                this.state['success'] = false;
                this.setState(this.state);
            }, 5000);

            return;
        } else {
            //all good, can update state now
            this.state[key] = val;
            this.setState(this.state);
        }
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

    register() {
        var name = this.state.name;
        var email = this.state.email;
        var password = this.state.password;
        var password2 = this.state.password2;

        var schoolName = this.state.schoolName;
        var classesArray = this.state.classesState;
        var useArray = this.state.useState;

        // the following code is to format all fo the checked classes into a string with commas
        var classes = '';
        for (var i = 0; i < classesArray.length; i++) {
            if (classesArray[i]['isChecked'] === true) {
                classes = classes + classesArray[i]['value'] + ', ';
            }
        }
        // remove the last space and comma
        if (classes !== '') {
            classes = classes.substring(0, classes.length - 2);
        }

        // format the use check boxes into a string (just like above)
        var use = '';
        for (var i = 0; i < useArray.length; i++) {
            if (useArray[i]['isChecked'] === true) {
                use = use + useArray[i]['value'] + ', ';
            }
        }
        // remove the last space and comma
        if (use !== '') {
            use = use.substring(0, use.length - 2);
        }

        let message = '';

        // check if any of the fields are left empty
        if (
            name === '' ||
            email === '' ||
            password === '' ||
            schoolName === ''
        ) {
            message = 'Please fill in all of the fields.';
        } else if (password !== password2) {
            message = 'Your passwords do not match. Please try again.';
        }

        if (message !== '') {
            this.state['message'] = message;
            this.state['success'] = false;
            this.setState(this.state);

            setTimeout(() => {
                this.state['message'] = '';
                this.state['success'] = false;
                this.setState(this.state);
            }, 5000);

            return;
        }

        //Before they register, users must agree to disclaimer.

        swal({
            title: 'Disclaimer!',
            text: "By signing up, you agree to not use Kontest.us for games that will change student grades, involve monetary prizes, or further your business's commercial interests. This website is intended for educational and/or entertainment purposes only.",
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willSignup) => {
            if (willSignup) {
                // request for sign up to backend

                regularRequest(
                    'admin/signup',
                    'POST',
                    {
                        displayName: name,
                        email: email,
                        password: password,

                        classes: classes,
                        schoolName: schoolName,
                        use: use,
                    },
                    (d) => {
                        //success
                        if (d.success) {
                            //automatically login user after signing up
                            this.loginUser(email, password);

                            // this.state['success'] = true
                            // this.state['message'] =  "Account has been created. You can now login."
                            // this.state['page'] = 3

                            // this.setState(this.state)

                            // // logs in after creating an account
                        } else {
                            this.state['message'] = d.message;
                            this.state['success'] = false;
                            this.setState(this.state);

                            setTimeout(() => {
                                this.state['message'] = '';
                                this.state['success'] = false;
                                this.setState(this.state);
                            }, 5000);
                        }
                    },
                );
            } else {
                return;
            }
        });
    }

    handleCheckClassesElement = (event) => {
        let classesState = this.state.classesState;
        classesState.forEach((aClass) => {
            if (aClass.value === event.target.value)
                aClass.isChecked = event.target.checked;
        });
        this.setState({ classesState: classesState });
    };

    handleCheckUseElement = (event) => {
        let useState = this.state.useState;
        useState.forEach((use) => {
            if (use.value === event.target.value)
                use.isChecked = event.target.checked;
        });
        this.setState({ useState: useState });
    };

    render() {
        let errorBox = null;

        var color = '#e11444';
        if (this.state.success) {
            color = '#05c793';
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

        let formBody = null;

        if (this.state.page === 0) {
            //name, email address

            formBody = (
                <div>
                    <h3
                        style={{
                            fontSize: '35px',
                            fontWeight: 'bold',
                            color: '#073b4c',
                        }}
                    >
                        Teacher Sign Up - 1/3{' '}
                    </h3>

                    <div className="form-group">
                        <label style={{ color: '#073b4c', fontWeight: 'bold' }}>
                            Name
                        </label>
                        <input
                            style={{ color: '#073b4c' }}
                            type="text"
                            className="form-control"
                            name="name"
                            value={this.state.name}
                            placeholder="Enter name"
                            onChange={this.valueChanged}
                        />
                    </div>

                    <div className="form-group">
                        <button
                            className="blue-btn"
                            onClick={() => this.updateState('page', 1)}
                        >
                            Next
                        </button>
                    </div>
                    <div className="form-group">
                        <Link to={'/admin/login'}>
                            <button className="red-btn">Back</button>
                        </Link>
                    </div>
                </div>
            );
        } else if (this.state.page === 1) {
            //school info

            formBody = (
                <div>
                    <h3
                        style={{
                            fontSize: '35px',
                            fontWeight: 'bold',
                            color: '#073b4c',
                        }}
                    >
                        Teacher Sign Up - 2/3
                    </h3>

                    <div className="form-group">
                        <label style={{ color: '#073b4c', fontWeight: 'bold' }}>
                            School Name
                        </label>
                        <input
                            style={{ color: '#073b4c' }}
                            type="text"
                            className="form-control"
                            name="schoolName"
                            value={this.state.schoolName}
                            placeholder="Enter School Name"
                            onChange={this.valueChanged}
                        />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', color: '#073b4c' }}>
                            Classes You Teach:
                        </label>
                        <br />
                        <ul style={{ color: '#073b4c' }}>
                            {this.state.classesState.map((aClass) => {
                                return (
                                    <CheckBox
                                        handleCheckChieldElement={
                                            this.handleCheckClassesElement
                                        }
                                        {...aClass}
                                    />
                                );
                            })}
                        </ul>
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', color: '#073b4c' }}>
                            What do you plan on using this site for:
                        </label>
                        <br />
                        <ul style={{ color: '#073b4c' }}>
                            {this.state.useState.map((use) => {
                                return (
                                    <CheckBox
                                        handleCheckChieldElement={
                                            this.handleCheckUseElement
                                        }
                                        {...use}
                                    />
                                );
                            })}
                        </ul>
                    </div>

                    <br></br>

                    <div className="form-group">
                        <button
                            className="blue-btn"
                            onClick={() => this.updateState('page', 2)}
                        >
                            Next
                        </button>
                    </div>

                    <div className="form-group">
                        <button
                            className="red-btn"
                            onClick={() => this.updateState('page', 0)}
                        >
                            Back
                        </button>
                    </div>
                </div>
            );
        } else if (this.state.page === 2) {
            //password

            formBody = (
                <div>
                    <h3
                        style={{
                            fontSize: '35px',
                            fontWeight: 'bold',
                            color: '#073b4c',
                        }}
                    >
                        Teacher Sign Up - 3/3
                    </h3>

                    <div className="form-group">
                        <label style={{ fontWeight: 'bold', color: '#073b4c' }}>
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
                        <label style={{ fontWeight: 'bold', color: '#073b4c' }}>
                            Password
                        </label>
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

                    <div className="form-group">
                        <label style={{ fontWeight: 'bold', color: '#073b4c' }}>
                            Re-enter Password
                        </label>
                        <input
                            style={{ color: '#073b4c' }}
                            type="password"
                            className="form-control"
                            name="password2"
                            value={this.state.password2}
                            placeholder="Re-enter password"
                            onChange={this.valueChanged}
                        />
                    </div>

                    <div className="form-group">
                        <button className="blue-btn" onClick={this.register}>
                            Sign Up
                        </button>
                    </div>

                    <div className="form-group">
                        <button
                            className="red-btn"
                            onClick={() => this.updateState('page', 1)}
                        >
                            Back
                        </button>
                    </div>
                </div>
            );
        } else if (this.state.page === 3) {
            //show "back to login"

            formBody = (
                <div style={{ textAlign: 'center' }}>
                    <h3
                        style={{
                            fontSize: '35px',
                            fontWeight: 'bold',
                            color: '#073b4c',
                        }}
                    >
                        Teacher Sign Up - Complete
                    </h3>

                    <Link to="/admin/login">
                        <button className="dark-green-btn">Go to Login</button>
                    </Link>
                </div>
            );
        }

        return (
            <div className={'App'}>
                {errorBox}
                <div className="auth-wrapper">
                    <div
                        className="auth-inner"
                        style={{ width: (window.innerWidth * 45) / 100 }}
                    >
                        {formBody}
                    </div>
                </div>
            </div>
        );
    }
}
