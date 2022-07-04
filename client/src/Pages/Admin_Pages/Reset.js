import React, { Component } from 'react';
import '../../style/index.css';
import '../../style/buttons.css';
import '../../style/account.css';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import firebase from 'firebase/app';
import 'firebase/auth';

export default class Reset extends Component {
    constructor(props) {
        super(props);

        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.reset = this.reset.bind(this);

        this.state = {
            email: '',
            message: '',
            success: true,
        };
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    reset() {
        var email = this.state.email;

        if (email === '') {
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

        var auth = firebase.auth();

        auth.sendPasswordResetEmail(email)
            .then(() => {
                // Email sent.
                this.setState({
                    email: '',
                    success: true,
                    message:
                        'Password has been reset. Please check your email inbox.',
                });
            })
            .catch((error) => {
                // An error happened.
                this.state['message'] = 'Error! Please try again';
                this.state['success'] = false;
                this.setState(this.state);

                setTimeout(() => {
                    this.state['message'] = '';
                    this.state['success'] = false;
                    this.setState(this.state);
                }, 5000);
            });
    }

    render() {
        let errorBox = null;

        var color = 'red';
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
                            Reset Password
                        </h3>

                        <div className="form-group">
                            <label>Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={this.state.email}
                                placeholder="Enter email"
                                onChange={this.valueChanged}
                            />
                        </div>

                        <button className="dark-green-btn" onClick={this.reset}>
                            Reset
                        </button>

                        <br></br>
                        <br />
                        <Link to={'/admin/login'}>
                            <button className="red-btn">Back</button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
