import React from 'react';
import CheckBox from '../components/checkbox';
import '../../../style/index.css';
import { adminRequest } from '../../Request';
import { Redirect, Link } from 'react-router-dom';
import Divider from '@material-ui/core/Divider';
import swal from 'sweetalert';

import firebase from 'firebase/app';
import 'firebase/auth';

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.saveInfo = this.saveInfo.bind(this);
        this.getAccountInfo = this.getAccountInfo.bind(this);
        this.handleCheckClassesElement =
            this.handleCheckClassesElement.bind(this);
        this.handleCheckUseElement = this.handleCheckUseElement.bind(this);
        this.valueChanged = this.valueChanged.bind(this);

        this.state = {
            accountInfo: {},
            username: firebase.auth().currentUser.displayName,
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
            schoolName: '', //input field
            email: '', //just text component
        };

        this.getAccountInfo();
    }

    /**
     * Sends GET request to server and gets all account info. Then updates the state
     */
    getAccountInfo() {
        adminRequest('admin/getAdminInformation', 'GET', {}, (d) => {
            if (d.success) {
                // formats classes into checkbox array
                var classStr = d.data['classes'];

                let curr = this.state;

                for (var i = 0; i < curr.classesState.length; i++) {
                    if (classStr.includes(curr.classesState[i]['value'])) {
                        curr['classesState'][i]['isChecked'] = true;
                    }
                }
                // formats use onto checkbox array
                var useStr = d.data['use'];

                for (var i = 0; i < curr.useState.length; i++) {
                    if (useStr.includes(curr.useState[i]['value'])) {
                        curr['useState'][i]['isChecked'] = true;
                    }
                }

                curr.schoolName = d.data['schoolName'];
                curr.email = d.data['email'];
                this.setState(curr);
            } else {
                swal('Error', d.message, 'error');
            }
        });
    }

    /**
     * Saves info in DB through POST request to server
     */
    saveInfo() {
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
        if (classes != '') {
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
        if (use != '') {
            use = use.substring(0, use.length - 2);
        }

        var theBody = {
            email: this.state.email,
            schoolName: this.state.schoolName,
            classes: classes,
            use: use,
            name: this.state.username,
        };
        // checks if schoolName is empty - nothing else can be empty
        if (this.state.schoolName === '') {
            swal('Please fill in the school name.', '', 'info');
        } else {
            adminRequest(
                'admin/updateAdminInformation',
                'POST',
                theBody,
                (d) => {
                    if (d.success) {
                        //update name

                        var user = firebase.auth().currentUser;

                        user.updateProfile({
                            displayName: this.state.username,
                        })
                            .then(function () {
                                swal(
                                    'Your changes have been saved!',
                                    '',
                                    'success',
                                );
                            })
                            .catch(function (error) {
                                let message = error.message;
                                swal(message, '', 'error');
                            });
                    } else {
                        swal(d.message, '', 'error');
                    }
                },
            );
        }
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        let curr = this.state;
        curr[key] = val;
        this.setState(curr);
    }

    // checks if any class checkbox in checked (event)
    handleCheckClassesElement = (event) => {
        let classesState = this.state.classesState;
        classesState.forEach((aClass) => {
            if (aClass.value === event.target.value)
                aClass.isChecked = event.target.checked;
        });
        this.setState({ classesState: classesState });
    };

    // checks if any use checkbox in checked (event)
    handleCheckUseElement = (event) => {
        let useState = this.state.useState;
        useState.forEach((use) => {
            if (use.value === event.target.value)
                use.isChecked = event.target.checked;
        });
        this.setState({ useState: useState });
    };

    render() {
        if (this.state.redirect) {
            return <Redirect push to="/admin/login" />;
        }
        let divStyle = {
            margin: '5%',
            marginTop: '5%',
            marginBottom: 0,
            marginRight: '15%',
        };

        let id = 0;

        function incrementId() {
            id += 1;
            return id;
        }

        return (
            <div className="pageDiv">
                <br />
                <br />

                <div style={divStyle}>
                    <h1 className="pageHeader">Account Info</h1>
                    <br />
                    <button
                        className="light-green-btn"
                        style={{ width: '200px' }}
                        onClick={this.saveInfo}
                    >
                        Save Changes
                    </button>
                    <br />
                    <br />
                    <Divider></Divider>
                    <br />
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label style={{ fontWeight: 'bold', align: 'left' }}>
                            Name:
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={this.state.username}
                            placeholder="Enter Name"
                            onChange={this.valueChanged}
                        />
                    </div>
                    <Divider></Divider>
                    <br />
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label style={{ fontWeight: 'bold', align: 'left' }}>
                            School Name:
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="schoolName"
                            value={this.state.schoolName}
                            placeholder="Enter School Name"
                            onChange={this.valueChanged}
                        />
                    </div>
                    <Divider></Divider>
                    <br />
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label style={{ fontWeight: 'bold', align: 'left' }}>
                            Email:
                        </label>
                        <p>{this.state.email}</p>
                    </div>
                    <Divider></Divider>
                    <br />
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontWeight: 'bold', align: 'left' }}>
                            Classes You Teach:
                        </label>
                        <br />
                        <ul style={{ textAlign: 'left' }}>
                            {this.state.classesState.map((aClass) => {
                                return (
                                    <CheckBox
                                        key={incrementId()}
                                        id={aClass['id']}
                                        handleCheckChieldElement={
                                            this.handleCheckClassesElement
                                        }
                                        {...aClass}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                    <Divider></Divider>
                    <br />
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontWeight: 'bold', align: 'left' }}>
                            What you plan on using this site for:
                        </label>
                        <br />
                        <ul style={{ textAlign: 'left' }}>
                            {this.state.useState.map((use) => {
                                return (
                                    <CheckBox
                                        key={incrementId()}
                                        id={use['id']}
                                        handleCheckChieldElement={
                                            this.handleCheckUseElement
                                        }
                                        {...use}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                    <br />
                    <button
                        className="trans-red-btn"
                        style={{ width: '200px' }}
                        onClick={this.props.deleteAccount}
                    >
                        Delete Account
                    </button>
                    <br />
                    <br /> <br />
                </div>
            </div>
        );
    }
}

export default Account;
