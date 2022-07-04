import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import '../../../style/toggle.css';
import TimePicker from 'react-bootstrap-time-picker';
import Divider from '@material-ui/core/Divider';
import 'react-datepicker/dist/react-datepicker.css';
import { adminGameRequest } from '../../Request';
import swal from 'sweetalert';
import firebase from 'firebase/app';
import 'firebase/auth';
import {
    getOffset,
    getDateObject,
    timeToServer,
    badDates,
    getTimezoneName,
    getNewDate,
} from '../../Date';
import Form from 'react-bootstrap/Form';
import PlayModal from '../modals/playpopup';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import Toggle from 'react-toggle';

class settings extends Component {
    constructor(props) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.startGame = this.startGame.bind(this);
        this.onValueChange = this.onValueChange.bind(this); // for studentFreedom Radio button only
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
        this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
        this.addCollab = this.addCollab.bind(this);
        this.leaveGame = this.leaveGame.bind(this);
        this.getAdminInfo = this.getAdminInfo.bind(this);
        this.getSettings = this.getSettings.bind(this);
        this.changeScoreVisibilityButton =
            this.changeScoreVisibilityButton.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this); // for duration input field change
        this.changeEndDateTimeAuto = this.changeEndDateTimeAuto.bind(this);
        this.setCurrentTime = this.setCurrentTime.bind(this);
        this.removeAdmin = this.removeAdmin.bind(this);
        this.copyGame = this.copyGame.bind(this);
        this.playGame = this.playGame.bind(this);
        this.changeTiming = this.changeTiming.bind(this);
        this.handlePublicChange = this.handlePublicChange.bind(this);

        this.state = {
            timeStart: '08:00',
            timeEnded: '08:00',
            live: false,
            public: false,
            type: '',
            numQuestions: 0,
            numTeams: 0,
            maxGuesses: 0,
            startDate: '2020-11-17',
            endDate: '2020-12-11',
            name: '',
            maxPerTeam: 0,
            studentFreedom: '1',
            message: '',
            success: true,
            collabEmail: '',
            head: [],
            admins: [],
            scoreVisibility: {},
            numScoreInput: 0,
            disabled: '',
            copiedGame: '',
            newAdminStatus: -1,
            playModal: this.props.playModal,
        };
    }

    componentDidMount() {
        this.getSettings();
    }

    getSettings() {
        // add redirect code
        adminGameRequest(
            'game/getSettings',
            'POST',
            this.props.gameID,
            { includeSeconds: false },
            (d) => {
                //success
                if (d.success) {
                    let settings = d.data;
                    let curr = this.state;

                    //WE CAN NOT FORGET ABOUT APPLYING THE TIMER OFFSET
                    let serverOffset = d.offset;

                    let start = timeToServer(
                        serverOffset,
                        settings.public.start,
                        false,
                    );

                    let startSplit = start.split(' ');

                    let end = timeToServer(
                        serverOffset,
                        settings.public.end,
                        false,
                    );
                    let endSplit = end.split(' ');

                    curr['timeStart'] = startSplit[1];
                    curr['timeEnded'] = endSplit[1];
                    curr['live'] = settings.private.live;
                    curr['numQuestions'] = parseInt(
                        settings.public.numQuestions,
                    );
                    curr['numTeams'] = parseInt(settings.public.numTeams);
                    curr['maxGuesses'] = parseInt(settings.public.guesses);
                    curr['startDate'] = startSplit[0];
                    curr['endDate'] = endSplit[0];
                    curr['name'] = settings.public.name;
                    curr['maxPerTeam'] = parseInt(settings.public.maxPerTeam);
                    curr['studentFreedom'] = settings.private.studentFreedom;
                    curr['scoreVisibility'] = settings.public.scoreVisibility;
                    curr['numScoreInput'] = settings.public.scoreVisibility.num;
                    curr['type'] = settings.public.type;
                    curr['public'] = settings.private.public;

                    curr['message'] = '';
                    curr['success'] = true;

                    if (settings.public.scoreVisibility.all) {
                        curr['disabled'] = 'disabled';
                    } else {
                        curr['disabled'] = '';
                    }

                    if (!this.props.isLimited) {
                        this.getAdminInfo(curr);
                    } else {
                        this.setState(curr);
                    }
                } else {
                    swal(d.message, '', 'error');

                    this.props.redirect();
                }
            },
        );
    }

    getAdminInfo(prevState) {
        // /adminInformation for the admins in game

        adminGameRequest(
            'admin/getAdminsInGame',
            'GET',
            this.props.gameID,
            {},
            (d) => {
                if (d.success) {
                    prevState['head'] = d.head;
                    prevState['admins'] = d.admins;

                    this.setState(prevState);
                }
            },
        );
    }

    copyGame() {
        adminGameRequest(
            'game/duplicateGame',
            'POST',
            this.props.gameID,
            {},
            (d) => {
                let newGameCode = d.data.newGameCode;

                swal(d.message, '', 'success').then(() => {
                    window.location.href = '/admin/dashboard/' + newGameCode;
                });
            },
        );
    }

    leaveGame() {
        swal({
            title: 'Are you sure?',
            text: 'If you are the head of this game, then game will be deleted if you leave. Do you want to continue?',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                adminGameRequest(
                    'admin/removeFromGame',
                    'DELETE',
                    this.props.gameID,
                    {},
                    (d) => {
                        swal(d.message, '', 'success');
                        this.props.goToPage('/admin/dashboard'); //redirects admin to the all games page
                    },
                );
            } else {
            }
        });
    }

    valueChanged(e) {
        //check if the start date is after the end date
        if (e.target.name === 'startDate') {
            if (
                badDates(
                    this.state.timeStart,
                    e.target.value,
                    this.state.timeEnded,
                    this.state.endDate,
                )
            ) {
                //Instead of alerting the user, we push back the end date/time a hour
                let newEndTime = getNewDate(
                    e.target.value,
                    this.state.timeStart,
                    1,
                );
                this.state[e.target.name] = e.target.value;
                this.state['timeEnded'] = newEndTime.time;
                this.state['endDate'] = newEndTime.date;
                this.setState(this.state);
                this.saveSettings();

                return;
            }
        } else if (e.target.name === 'endDate') {
            if (
                badDates(
                    this.state.timeStart,
                    this.state.startDate,
                    this.state.timeEnded,
                    e.target.value,
                )
            ) {
                swal(
                    'Your start time is after your end time! Please enter another end date.',
                    '',
                    'error',
                );
                return;
            }
        }

        this.updateState(e.target.name, e.target.value);
    }

    startGame() {
        if (this.state.live) {
            this.updateState('live', false);
            this.props.updateLive(false);
        } else {
            this.setCurrentTime();
            this.updateState('playModal', true);
        }
    }

    updateState(key, val) {
        this.state[key] = val;

        this.setState(this.state);
        console.log(key);

        if (
            key != 'playModal' &&
            key != 'message' &&
            key != 'success' &&
            key != 'admins' &&
            key != 'head' &&
            key != 'newAdminStatus'
        ) {
            this.saveSettings();
        }
    }

    handlePublicChange(event) {
        this.updateState('public', event.target.checked);
    }

    addCollab() {
        var data = {
            adminEmail: this.state.collabEmail,
            status: parseInt(this.state.newAdminStatus),
        };

        if (data.adminEmail === '') {
            swal('Please enter a teacher email.', '', 'error');
        } else if (data.status === -1) {
            swal(
                'Please select permissions for the teacher that you are adding.',
                '',
                'error',
            );
        } else {
            adminGameRequest(
                'game/addAdminToGame',
                'POST',
                this.props.gameID,
                data,
                (d) => {
                    this.updateState('message', d.message);
                    this.updateState('success', d.success);

                    this.getSettings();
                },
            );
        }
    }

    onValueChange(event) {
        this.updateState('studentFreedom', event.target.value);
    }

    handleStartTimeChange(timeStart) {
        //timeStart is an integer in the form hours * 3600 + minutes * 60 + seconds

        timeStart = parseInt(timeStart);

        var hours = Math.floor(timeStart / 3600);

        timeStart -= hours * 3600;

        var minutes = Math.floor(timeStart / 60);

        var time = '';

        if (String(hours).length === 1) {
            time = '0' + hours + ':';
        } else {
            time = hours + ':';
        }

        if (String(minutes).length === 1) {
            time += '0' + minutes;
        } else {
            time += minutes;
        }

        //check if the start date is after the end date
        if (
            badDates(
                time,
                this.state.startDate,
                this.state.timeEnded,
                this.state.endDate,
            )
        ) {
            //Instead of alerting the user, we push back the end date/time a hour
            let newEndTime = getNewDate(this.state.startDate, time, 1);
            this.state['timeStart'] = time;
            this.state['timeEnded'] = newEndTime.time;
            this.state['endDate'] = newEndTime.date;
            this.setState(this.state);
            this.saveSettings();

            return;
        }

        this.state['timeStart'] = time;
        this.setState(this.state);

        this.saveSettings();
    }

    handleEndTimeChange(timeEnded) {
        //timeEnded is an integer in the form hours * 3600 + minutes * 60 + seconds

        timeEnded = parseInt(timeEnded);

        var hours = Math.floor(timeEnded / 3600);

        timeEnded -= hours * 3600;

        var minutes = Math.floor(timeEnded / 60);

        var time = '';

        if (String(hours).length === 1) {
            time = '0' + hours + ':';
        } else {
            time = hours + ':';
        }

        if (String(minutes).length === 1) {
            time += '0' + minutes;
        } else {
            time += minutes;
        }

        //check if the start date is after the end date
        if (
            badDates(
                this.state.timeStart,
                this.state.startDate,
                time,
                this.state.endDate,
            )
        ) {
            swal(
                'Your start time is after your end time! Please enter another end time.',
                '',
                'error',
            );
            return;
        }

        this.state['timeEnded'] = time;
        this.setState(this.state);

        this.saveSettings();
    }

    setCurrentTime() {
        //set start and ending time/date based on today
        var d = new Date();

        //time first

        let hours = d.getHours();
        let minutes = d.getMinutes();
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();

        //get closest quarter time

        let totalTime = hours * 60 + minutes;
        totalTime = Math.ceil(totalTime / 5) * 5;

        hours = parseInt(totalTime / 60);
        minutes = totalTime % 60;

        // minutes = (((minutes + 2.5)/5 | 0) * 5) % 60;
        // hours = ((((minutes/105) + .5) | 0) + hours) % 24;

        if (String(minutes).length === 1) {
            minutes = '0' + minutes;
        }

        if (String(hours).length === 1) {
            hours = '0' + hours;
        }

        if (String(day).length === 1) {
            day = '0' + day;
        }

        if (String(month).length === 1) {
            month = '0' + month;
        }

        let timeStart = hours + ':' + minutes;
        let startDate = year + '-' + month + '-' + day;

        this.state['startDate'] = startDate;
        this.state['timeStart'] = timeStart;

        //check if the start date is after the end date
        if (
            badDates(
                timeStart,
                startDate,
                this.state.timeEnded,
                this.state.endDate,
            )
        ) {
            //Instead of alerting the user, we push back the end date/time a hour
            let newEndTime = getNewDate(startDate, timeStart, 1);
            this.state['timeEnded'] = newEndTime.time;
            this.state['endDate'] = newEndTime.date;
            this.setState(this.state);
            this.saveSettings();

            return;
        }

        this.setState(this.state);

        this.saveSettings();
    }

    saveSettings() {
        return new Promise((resolve) => {
            //asynchronous method

            var localOffset = getOffset(false);

            let data = {
                numQuestions: this.state.numQuestions,
                end: this.state.endDate + ' ' + this.state.timeEnded,
                start: this.state.startDate + ' ' + this.state.timeStart,
                numTeams: this.state.numTeams,
                gameName: this.state.name,
                guesses: this.state.maxGuesses,
                maxPerTeam: this.state.maxPerTeam,
                live: this.state.live,
                studentFreedom: this.state.studentFreedom,
                scoreVisibility: this.state.scoreVisibility,
                showAnswer: this.state.showAnswer,
                offset: localOffset,
                public: this.state.public,
            };

            adminGameRequest(
                'game/updateSettings',
                'POST',
                this.props.gameID,
                data,
                (d) => {
                    resolve(true);

                    this.updateState('message', d.message);
                    this.updateState('success', d.success);
                },
            );
        });
    }

    changeScoreVisibilityButton(all, num) {
        if (all) {
            this.state.scoreVisibility['all'] = true;
            this.state.scoreVisibility['num'] = parseInt(this.state.numTeams);
            this.state.disabled = 'disabled';
        } else {
            if (num === 0) {
                this.state.scoreVisibility['all'] = false;
                this.state.scoreVisibility['num'] = 0;
                this.state.disabled = '';
            } else {
                this.state.scoreVisibility['all'] = false;
                this.state.scoreVisibility['num'] = parseInt(
                    this.state.numScoreInput,
                );
                this.state.disabled = '';
            }
        }

        this.setState(this.state);

        this.saveSettings();
    }

    // set to 15 minutes, then 30 minutes, then 1 hour
    changeTiming(minutes) {
        this.changeEndDateTimeAuto(0, minutes);
    }

    /**
     * helper method to update end time and end date
     *
     **/
    changeEndDateTimeAuto(addHour, addMinute) {
        // for am single digit times, Date class only takes 09:34 instead of 9:34
        let startDateArr = this.state.timeStart.split(':');

        let dateString = '';

        if (String(startDateArr[0]).length === 1) {
            dateString =
                this.state.startDate + ' ' + '0' + this.state.timeStart;
        } else {
            dateString = this.state.startDate + ' ' + this.state.timeStart;
        }

        //https://stackoverflow.com/questions/13363673/javascript-date-is-invalid-on-ios
        //Need to do this for mobile devices do to ES5 specification

        let d = getDateObject(dateString);

        d.setTime(d.getTime() + addMinute * 60 * 1000);

        let hours = d.getHours();
        let minutes = d.getMinutes();
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();

        if (String(minutes).length === 1) {
            minutes = '0' + minutes;
        }

        if (String(hours).length === 1) {
            hours = '0' + hours;
        }

        if (String(day).length === 1) {
            day = '0' + day;
        }

        if (String(month).length === 1) {
            month = '0' + month;
        }

        let timeEnd = hours + ':' + minutes;
        let endDate = year + '-' + month + '-' + day;

        this.state['timeEnded'] = timeEnd;
        this.state['endDate'] = endDate;

        this.setState(this.state);
        this.saveSettings(this.state);
    }
    /**
     * handles change of duration
     * state variable needed: duration
     **/

    onTimeChange(event, value) {
        const newTime = value.replace(/-/g, ':');

        var addHour = parseInt(newTime.substring(0, 2));
        var addMinute = parseInt(newTime.substring(3, 5));

        this.changeEndDateTimeAuto(addHour, addMinute);
    }

    removeAdmin(teacherEmail) {
        swal({
            title: 'Are you sure?',
            text:
                'If you continue, ' +
                teacherEmail +
                ' will be removed from this game.',

            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                adminGameRequest(
                    'admin/forcedRemoveFromGame',
                    'DELETE',
                    this.props.gameID,
                    { email: teacherEmail },
                    (d) => {
                        this.getSettings();
                    },
                );
            } else {
            }
        });
    }

    async playGame() {
        this.state['live'] = true;
        this.setState(this.state);

        //need to save the settings before playing the game. Saving is async, so we must wait.
        await this.saveSettings();

        this.props.playGame();
    }

    render() {
        let bgStyle = {
            backgroundColor: '#f8fafd',

            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            margin: 'auto',
            marginTop: '10px',
            width: '80%',
        };

        let bgTransparentStyle = {
            backgroundColor: 'transparent',

            borderColor: 'transparent',

            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            margin: 'auto',
            marginTop: '10px',
            width: '80%',
        };

        let bgStyle2 = {
            backgroundColor: '#f8fafd',
            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            margin: 'auto',
            marginTop: '10px',
            width: '40%',
        };

        let allDivStyle = {
            backgroundColor: '#f6f8fb',
            // height: '100px',
            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            margin: '15px',
            paddingLeft: '2em',
            paddingRight: '2em',
        };

        let numDivStyle = {
            backgroundColor: '#f6f8fb',
            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            margin: '15px',
        };

        let noneDivStyle = {
            backgroundColor: '#f6f8fb',
            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            margin: '15px',
        };

        if (this.state.scoreVisibility['all']) {
            allDivStyle['backgroundColor'] = '#aaf0d1';
            numDivStyle['backgroundColor'] = '#f6f8fb';
            noneDivStyle['backgroundColor'] = '#f6f8fb';
        } else {
            if (this.state.scoreVisibility['num'] === 0) {
                allDivStyle['backgroundColor'] = '#f6f8fb';
                numDivStyle['backgroundColor'] = '#f6f8fb';
                noneDivStyle['backgroundColor'] = '#aaf0d1';
            } else {
                allDivStyle['backgroundColor'] = '#f6f8fb';
                numDivStyle['backgroundColor'] = '#aaf0d1';
                noneDivStyle['backgroundColor'] = '#f6f8fb';
            }
        }

        let transparentbg = {
            backgroundColor: 'transparent',

            borderColor: 'transparent',

            borderWidth: 2,
            borderRadius: '10px',
            margin: 'auto',
            marginTop: '20px',
            width: '80%',
        };
        let textStyle = {
            color: '#093145',
            fontSize: '18px',
            marginBottom: '5px',
            fontWeight: 'bold',
        };

        var c = 1;

        let currentUserEmail = firebase.auth().currentUser.email;
        let isAdmin = this.state.head['email'] === currentUserEmail;
        let leaveText = isAdmin ? 'Delete Game' : 'Leave Game';

        let getStatusPermText = (status) => {
            let text = '';
            status = parseInt(status);
            if (status === 0) {
                text =
                    'can add questions, change settings, manage teams, and add/remove teacher collaborators.';
            } else if (status === 1) {
                text = 'can add questions, change settings, and manage teams.';
            } else if (status >= 2) {
                text = 'can only view the questions.';
            } else {
                text = '';
            }
            return text;
        };

        let infoText;
        let permissionText =
            'They ' + getStatusPermText(this.state.newAdminStatus);

        if (permissionText == 'They ') {
            permissionText = '';
        }

        var admins = [];
        var readers = [];

        for (var admin of this.state.admins) {
            var col = 'black';

            let email = admin['email'];
            let status = admin['status'];

            //Let the user know what perms they have
            if (email === currentUserEmail) {
                infoText = 'You ' + getStatusPermText(status);
            }

            if (admin['email'] === this.state.head['email']) {
                admins.unshift(
                    <tbody id="table-body" key={c}>
                        <tr>
                            <td
                                style={{
                                    backgroundColor: '#aaf0d1',
                                    color: '#black',
                                }}
                            >
                                {' '}
                                Head:
                            </td>
                            <td style={{ color: col }}> {admin['name']} </td>

                            <td style={{ color: col }}> {admin['email']} </td>
                            <td style={{ backgroundColor: '#aaf0d1' }}> </td>
                        </tr>
                    </tbody>,
                );
            } else if (status === 1) {
                admins.push(
                    <tbody id="table-body" key={c}>
                        <tr>
                            <td
                                style={{
                                    backgroundColor: '#3a6e7f',
                                    color: 'white',
                                }}
                            >
                                {' '}
                                Writer:
                            </td>
                            <td style={{ color: col }}> {admin['name']} </td>

                            <td style={{ color: col }}> {admin['email']} </td>
                            {isAdmin ? (
                                <td style={{ color: col }}>
                                    <button
                                        className="red-btn"
                                        onClick={() => this.removeAdmin(email)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            ) : null}
                        </tr>
                    </tbody>,
                );
            } else {
                readers.push(
                    <tbody id="table-body" key={c}>
                        <tr>
                            <td
                                style={{
                                    backgroundColor: '#fff2d3',
                                    color: 'black',
                                }}
                            >
                                {' '}
                                Reader:
                            </td>
                            <td style={{ color: col }}> {admin['name']} </td>

                            <td style={{ color: col }}> {admin['email']} </td>
                            {isAdmin ? (
                                <td style={{ color: col }}>
                                    <button
                                        className="red-btn"
                                        onClick={() => this.removeAdmin(email)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            ) : null}
                        </tr>
                    </tbody>,
                );
            }

            c += 1;
        }

        admins = admins.concat(readers);

        var addCollabDiv;

        if (isAdmin) {
            addCollabDiv = (
                <div style={bgStyle}>
                    <Card.Text style={textStyle}>
                        Teacher Collaborators
                    </Card.Text>

                    <p>{infoText}</p>
                    <br />
                    <div
                        style={{
                            float: 'center',
                            textAlign: 'center',
                            width: 'fit-content',
                        }}
                        className="center"
                    >
                        <table style={{ width: '100%', height: '100%' }}>
                            {admins}
                        </table>
                    </div>
                    <br />
                    <hr />
                    <br />
                    <Card.Text style={textStyle}>Add Collaborators</Card.Text>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'row',
                        }}
                    >
                        <input
                            placeholder="Enter Teacher Email"
                            style={{
                                width: '50%',
                                textAlign: 'center',
                                border: '1px solid #ccc',
                            }}
                            type="text"
                            name="collabEmail"
                            onChange={this.valueChanged}
                            value={this.state.collabEmail}
                        ></input>
                        <Form.Control
                            value={parseInt(this.state.newAdminStatus)}
                            style={{ width: '20%' }}
                            name="newAdminStatus"
                            onChange={this.valueChanged}
                            label="Permissions"
                            as="select"
                        >
                            <option value={-1} disabled hidden>
                                Permissions
                            </option>

                            <option value={1}>Writer</option>
                            <option value={2}>Reader</option>
                        </Form.Control>
                        <button
                            className="blue-btn"
                            style={{
                                height: '35px',
                                marginLeft: '5px',
                                width: '100px',
                            }}
                            onClick={this.addCollab}
                        >
                            Add
                        </button>
                    </div>

                    <p>{permissionText}</p>
                </div>
            );
        } else if (!this.props.isLimited) {
            addCollabDiv = (
                <div style={bgStyle}>
                    <Card.Text style={textStyle}>
                        Teacher Collaborators
                    </Card.Text>

                    <br />
                    <p>{infoText}</p>
                    <br />
                    <div
                        style={{
                            float: 'center',
                            textAlign: 'center',
                            width: 'fit-content',
                        }}
                        className="center"
                    >
                        <table style={{ width: '100%', height: '100%' }}>
                            {admins}
                        </table>
                    </div>
                    <br />
                </div>
            );
        }

        if (this.state.message != '' && !this.state.success) {
            swal(this.state.message, '', 'error');
            this.state['message'] = '';
            this.state['success'] = true;
            this.setState(this.state);
        }

        let gameType = '';

        if (parseInt(this.state.type) === 1) {
            gameType = 'Estimation Game';
        } else if (parseInt(this.state.type) === 2) {
            gameType = 'Review Game';
        }

        return (
            <div className="pageDiv">
                <Card.Body>
                    <br />
                    <br />

                    <div style={transparentbg}>
                        <h1
                            className="pageHeader"
                            style={{
                                width: '80%',
                                margin: 'auto',
                                marginBottom: '-20px',
                            }}
                        >
                            {' '}
                            Game Settings
                        </h1>{' '}
                        <br />
                        <i style={{ width: '80%' }}>
                            {this.props.isLimited
                                ? "To play this game with your students, please duplicate this game. You can also view this game's questions."
                                : '  All changes automatically save'}
                        </i>
                    </div>

                    <Divider></Divider>

                    <div style={bgStyle}>
                        <Card.Text style={textStyle}>Name:</Card.Text>

                        <input
                            placeholder="Enter the name"
                            readOnly={this.props.isLimited}
                            style={{
                                marginBottom: '5px',
                                width: '50%',
                                textAlign: 'center',
                                border: '1px solid #ccc',
                            }}
                            type="text"
                            name="name"
                            onChange={this.valueChanged}
                            value={this.state.name}
                        ></input>
                        <br></br>
                        <Card.Text style={textStyle}>
                            Code: {this.props.gameID}
                        </Card.Text>
                        <Card.Text style={textStyle}>
                            Type: {gameType}
                        </Card.Text>

                        {!this.props.isLimited ? (
                            <>
                                <Card.Text style={textStyle}>Public:</Card.Text>

                                <p>
                                    {this.state.public
                                        ? 'Viewable by all teachers.'
                                        : 'Not viewable to outside teachers.'}{' '}
                                </p>

                                <Toggle
                                    checked={this.state.public}
                                    aria-label="Public"
                                    onChange={this.handlePublicChange}
                                />

                                <hr />
                            </>
                        ) : null}

                        <br></br>
                        {!this.props.isLimited ? (
                            <button
                                className="dark-green-btn"
                                style={{ marginRight: '10px', width: '200px' }}
                                onClick={this.startGame}
                            >
                                {this.state.live ? 'Stop Game' : 'Play Game'}
                            </button>
                        ) : null}
                        <button
                            className="blue-btn"
                            style={{ width: '200px' }}
                            onClick={this.copyGame}
                        >
                            Duplicate Game
                        </button>

                        {!this.props.isLimited ? (
                            <button
                                className="red-btn"
                                style={{ marginLeft: '10px', width: '200px' }}
                                onClick={this.leaveGame}
                            >
                                {leaveText}
                            </button>
                        ) : null}
                    </div>

                    {this.state.live && !this.props.isLimited ? (
                        <div>
                            <div className="row2" style={bgTransparentStyle}>
                                <div className="rows2" style={bgStyle2}>
                                    <Card.Text style={textStyle}>
                                        Start Time
                                    </Card.Text>
                                    <div>
                                        <TimePicker
                                            start="0:00"
                                            end="23:59"
                                            step={5}
                                            name="timeStart"
                                            onChange={
                                                this.handleStartTimeChange
                                            }
                                            value={this.state.timeStart}
                                        />
                                    </div>
                                    <br />

                                    <Card.Text style={textStyle}>
                                        Start Date
                                    </Card.Text>

                                    <input
                                        type="date"
                                        value={this.state.startDate}
                                        onChange={this.valueChanged}
                                        name="startDate"
                                        className="form-control"
                                        style={{ border: '1px solid #ccc' }}
                                    ></input>
                                    <br></br>

                                    <button
                                        className="trans-blue-btn margin small1"
                                        onClick={this.setCurrentTime}
                                    >
                                        Set to Right Now
                                    </button>
                                </div>

                                <div className="rows2" style={bgStyle}>
                                    <Card.Text style={textStyle}>
                                        Time Zone: {getTimezoneName()}
                                    </Card.Text>
                                    <br></br>
                                    <Card.Text style={textStyle}>
                                        Duration
                                    </Card.Text>
                                    <p>
                                        Click below to quickly set the end
                                        time/date.
                                    </p>
                                    <div>
                                        <br />

                                        <button
                                            className="trans-blue-btn margin small1"
                                            onClick={() =>
                                                this.changeEndDateTimeAuto(
                                                    0,
                                                    15,
                                                )
                                            }
                                        >
                                            {' '}
                                            15 Min
                                        </button>

                                        <button
                                            className="trans-blue-btn margin small1"
                                            onClick={() =>
                                                this.changeEndDateTimeAuto(
                                                    0,
                                                    30,
                                                )
                                            }
                                        >
                                            {' '}
                                            30 Min
                                        </button>

                                        <button
                                            className="trans-blue-btn margin small1"
                                            onClick={() =>
                                                this.changeEndDateTimeAuto(
                                                    0,
                                                    60,
                                                )
                                            }
                                        >
                                            {' '}
                                            1 Hour
                                        </button>
                                    </div>
                                    <br />
                                </div>

                                <div className="rows2" style={bgStyle2}>
                                    <Card.Text style={textStyle}>
                                        End Time
                                    </Card.Text>
                                    <div>
                                        <TimePicker
                                            start="0:00"
                                            end="23:59"
                                            step={5}
                                            name="timeEnded"
                                            value={this.state.timeEnded}
                                            onChange={this.handleEndTimeChange}
                                        />
                                    </div>
                                    <br />
                                    <Card.Text style={textStyle}>
                                        End Date
                                    </Card.Text>

                                    <input
                                        type="date"
                                        value={this.state.endDate}
                                        onChange={this.valueChanged}
                                        name="endDate"
                                        className="form-control"
                                    ></input>
                                </div>
                            </div>

                            <div style={bgStyle}>
                                <Card.Text style={textStyle}>
                                    Max Number of Total Guesses
                                </Card.Text>

                                <input
                                    placeholder="Enter a number"
                                    min={1}
                                    max={100}
                                    style={{
                                        width: '50%',
                                        textAlign: 'center',
                                        border: '1px solid #ccc',
                                    }}
                                    type="number"
                                    name="maxGuesses"
                                    onChange={this.valueChanged}
                                    value={this.state.maxGuesses}
                                ></input>
                            </div>

                            <div style={bgStyle}>
                                <Card.Text style={textStyle}>
                                    Max Number of People Per Team
                                </Card.Text>
                                <p>
                                    This only applies when students are joining
                                    teams.
                                </p>
                                <input
                                    placeholder="Enter a number"
                                    min={1}
                                    max={100}
                                    style={{
                                        width: '50%',
                                        textAlign: 'center',
                                        border: '1px solid #ccc',
                                    }}
                                    type="number"
                                    name="maxPerTeam"
                                    onChange={this.valueChanged}
                                    value={this.state.maxPerTeam}
                                ></input>
                            </div>

                            <div style={bgStyle}>
                                <Card.Text style={textStyle}>
                                    Student Permissions
                                </Card.Text>

                                <div className="radio">
                                    <label>
                                        <input
                                            type="radio"
                                            value="1"
                                            checked={
                                                this.state.studentFreedom ===
                                                '1'
                                            }
                                            onChange={this.onValueChange}
                                        />
                                        &nbsp;&nbsp; Students can't do anything
                                    </label>
                                </div>
                                <div className="radio">
                                    <label>
                                        <input
                                            type="radio"
                                            value="2"
                                            checked={
                                                this.state.studentFreedom ===
                                                '2'
                                            }
                                            onChange={this.onValueChange}
                                        />
                                        &nbsp;&nbsp; Students can join and leave
                                        teams
                                    </label>
                                </div>
                                <div className="radio">
                                    <label>
                                        <input
                                            type="radio"
                                            value="3"
                                            checked={
                                                this.state.studentFreedom ===
                                                '3'
                                            }
                                            onChange={this.onValueChange}
                                        />
                                        &nbsp;&nbsp; Students can join, create,
                                        and leave teams
                                    </label>
                                </div>
                            </div>

                            <div className="rows" style={bgStyle}>
                                <Card.Text style={textStyle}>
                                    Score Visibility
                                </Card.Text>
                                <p>
                                    Click an option to change the scores shown
                                    to the players.
                                </p>
                                <button
                                    className="row"
                                    style={allDivStyle}
                                    onClick={() =>
                                        this.changeScoreVisibilityButton(
                                            true,
                                            this.state.numScoreInput,
                                        )
                                    }
                                >
                                    <Card.Text style={textStyle}>
                                        Show <br />
                                        ALL <br /> Scores
                                    </Card.Text>
                                </button>

                                <button
                                    className="row"
                                    style={numDivStyle}
                                    onClick={() =>
                                        this.changeScoreVisibilityButton(
                                            false,
                                            this.state.numScoreInput,
                                        )
                                    }
                                >
                                    <Card.Text style={textStyle}>
                                        Show Top <br />
                                        <input
                                            disabled={this.state.disabled}
                                            placeholder="Enter a number"
                                            min={0}
                                            max={this.state.numTeams}
                                            style={{
                                                width: '50%',
                                                textAlign: 'center',
                                                border: '1px solid #ccc',
                                            }}
                                            type="number"
                                            name="numScoreInput"
                                            onChange={this.valueChanged}
                                            value={this.state.numScoreInput}
                                        ></input>
                                        Teams
                                    </Card.Text>
                                </button>

                                <button
                                    className="row"
                                    style={noneDivStyle}
                                    onClick={() =>
                                        this.changeScoreVisibilityButton(
                                            false,
                                            0,
                                        )
                                    }
                                >
                                    <Card.Text style={textStyle}>
                                        Don't <br />
                                        Display <br /> Any Scores
                                    </Card.Text>
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {addCollabDiv}

                    {!this.props.isFullScreen ? (
                        <AiOutlineFullscreen
                            onClick={this.props.changeFullScreen}
                            className="full-screen-icon"
                        ></AiOutlineFullscreen>
                    ) : (
                        <AiOutlineFullscreenExit
                            onClick={this.props.changeFullScreen}
                            className="full-screen-icon"
                        ></AiOutlineFullscreenExit>
                    )}

                    <br></br>
                </Card.Body>

                {this.state.playModal ? (
                    <PlayModal
                        timeStart={this.state.timeStart}
                        startDate={this.state.startDate}
                        timeEnded={this.state.timeEnded}
                        endDate={this.state.endDate}
                        studentFreedom={this.state.studentFreedom}
                        maxGuesses={this.state.maxGuesses}
                        maxPerTeam={this.state.maxPerTeam}
                        scoreVisibility={this.state.scoreVisibility}
                        numScoreInput={this.state.numScoreInput}
                        disabled={this.state.disabled}
                        numTeams={this.state.numTeams}
                        valueChanged={this.valueChanged}
                        onValueChange={this.onValueChange}
                        handleStartTimeChange={this.handleStartTimeChange}
                        changeTiming={this.changeTiming}
                        changeScoreVisibilityButton={
                            this.changeScoreVisibilityButton
                        }
                        getTimezoneName={this.getTimezoneName}
                        setCurrentTime={this.setCurrentTime}
                        playGame={this.playGame}
                        hideModal={() => this.updateState('playModal', false)}
                    ></PlayModal>
                ) : null}
            </div>
        );
    }
}

export default settings;
