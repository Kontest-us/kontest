import React from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import '../../style/index.css';
import '../../style/buttons.css';
import { adminGameRequest, adminRequest } from '../Request';
import { Redirect, Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Divider from '@material-ui/core/Divider';
import TimePicker from 'react-bootstrap-time-picker';
import swal from 'sweetalert';
import TimeField from 'react-simple-timefield';
import { duration } from '@material-ui/core';
import { getOffset, badDates, getTimezoneName, getNewDate } from '../Date';
import Tooltip from '@material-ui/core/Tooltip';

class NewGame extends React.Component {
    constructor(props) {
        super(props);

        this.createGame = this.createGame.bind(this);
        this.valueChanged = this.valueChanged.bind(this);
        this.redirect = this.redirect.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
        this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.createNewGame = this.createNewGame.bind(this);
        this.changeEndDateTimeAuto = this.changeEndDateTimeAuto.bind(this);
        this.changeTiming = this.changeTiming.bind(this);

        //set start and ending time/date based on today
        var d = new Date();

        //time first

        let hours = d.getHours();
        let minutes = d.getMinutes();
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();

        //get closest quarter time
        minutes = ((((minutes + 7.5) / 15) | 0) * 15) % 60;
        hours = (((minutes / 105 + 0.5) | 0) + hours) % 24;

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

        let additionalHours = 1;

        let endTimeData = getNewDate(startDate, timeStart, additionalHours);

        let timeEnded = endTimeData.time;
        let endDate = endTimeData.date;

        this.state = {
            message: '',
            success: false,
            redirect: false,
            windowWidth: window.innerWidth,
            state: 1, //0  settings, 1 is questions and 2 is teams
            timeStart: timeStart,
            timeEnded: timeEnded,
            startDate: startDate,
            endDate: endDate,
            type: '',
            gameCode: '',
            end: '',
            guesses: 20,
            name: '',
            numQuestions: '',
            numTeams: 0,
            start: '',
            maxPerTeam: 5,
            duration: '00:30:00', //  duration input
            studentFreedom: '3', //1 -> can't do anything, 2 - > can join and leave teams, 3 -> join, create, and leave teams
            scoreVisibility: 0, // how many top team scores to show in game
            // scoreVisibility can be : an integer ONLY
        };
    }

    createNewGame() {
        adminRequest('game/randomCode', 'GET', {}, (d) => {
            if (d.success) {
                this.state['gameCode'] = d.code;
                this.setState(this.state);
            } else {
                swal('Error!', d.message, 'error');
            }
        });
    }

    componentDidMount() {
        this.createNewGame();
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

    updateState(key, val) {
        if (key === 'gameCode') {
            val = val.toUpperCase();
        }

        this.state[key] = val;
        this.setState(this.state);
    }

    // the following function is used fro the radio buttons
    onValueChange(event) {
        this.updateState('studentFreedom', event.target.value);
    }

    formSubmit(event) {
        event.preventDefault();
    }

    createGame() {
        // concatenates time and date for both start and end
        var concatStart = this.state.startDate + ' ' + this.state.timeStart;
        var concatEnd = this.state.endDate + ' ' + this.state.timeEnded;

        // saves concatenated version in state
        this.updateState('start', concatStart);
        this.updateState('end', concatEnd);

        //get time zone offset

        var d = new Date();
        var localOffset = getOffset(false);

        let settings = {
            studentFreedom: this.state.studentFreedom, //1 -> can't do anything, 2 - > can join and leave teams, 3 -> join, create, and leave teams
            end: this.state.end,
            guesses: this.state.guesses,
            maxPerTeam: this.state.maxPerTeam,
            name: this.state.name,
            start: this.state.start,
            live: false, //game is automatically not live
            scoreVisibility: this.state.scoreVisibility, // Since there are
            type: this.state.type,
            offset: localOffset,
        };

        // check to see if all fields are filled in
        var proceed = true;
        for (var key of Object.keys(settings)) {
            if (
                (settings[key] === '' || settings[key] === 0) &&
                key !== 'live' &&
                key !== 'scoreVisibility'
            ) {
                // this.updateState('message', "Please fill in all fields")
                swal('Please fill in all fields.', '', 'error');

                proceed = false;
            }
        }

        // check to see if start date is less than end date
        if (proceed) {
            if (
                new Date(settings['start'].replace(' ', 'T')) >
                new Date(settings['end'].replace(' ', 'T'))
            ) {
                // alert(new Date(settings['end']))
                swal({
                    title: 'Are you sure?',
                    text: 'Your end time is equal to or before your start time. This means the game will not be played. Are you sure you want to continue?',
                    icon: 'warning',
                    buttons: true,
                    dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        if (proceed) {
                            adminGameRequest(
                                'game/createGame',
                                'POST',
                                this.state.gameCode,
                                settings,
                                (d) => {
                                    if (d.success) {
                                        this.updateState('message', d.message);
                                        this.updateState('success', d.success);
                                    } else {
                                        this.updateState('message', d.message);
                                        this.updateState('success', d.success);
                                    }
                                },
                            );
                        }
                    } else {
                        proceed = false;
                        this.updateState(
                            'message',
                            'Please input valid time limit.',
                        );
                    }
                });
            } else {
                if (proceed) {
                    adminGameRequest(
                        'game/createGame',
                        'POST',
                        this.state.gameCode,
                        settings,
                        (d) => {
                            if (d.success) {
                                this.updateState('message', d.message);
                                this.updateState('success', d.success);
                            } else {
                                this.updateState('message', d.message);
                                this.updateState('success', d.success);
                            }
                        },
                    );
                }
            }
        }
    }

    redirect() {
        this.updateState('redirect', true);
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
            return;
        }

        this.updateState('timeStart', time);
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

        this.updateState('timeEnded', time);
    }

    /**
     * helper method to update end time and end date
     **/

    changeEndDateTimeAuto(addHour, addMinute) {
        let d = new Date(
            this.state.startDate.substring(0, 4),
            parseInt(this.state.startDate.substring(5, 7)) - 1,
            this.state.startDate.substring(8, 10),
            this.state.timeStart.substring(0, 2),
            this.state.timeStart.substring(3, 5),
        );

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

        this.updateState('timeEnded', timeEnd);
        this.updateState('endDate', endDate);
    }

    onTimeChange(event, value) {
        const newTime = value.replace(/-/g, ':');

        const timeSeconds = newTime.substr(0, 5);

        var addHour = parseInt(newTime.substring(0, 2));
        var addMinute = parseInt(newTime.substring(3, 5));

        this.changeEndDateTimeAuto(addHour, addMinute);

        this.updateState('duration', timeSeconds);
    }

    // set to 15 minutes, then 30 minutes, then 1 hour
    changeTiming(minutes) {
        this.changeEndDateTimeAuto(0, minutes);
    }

    render() {
        var col = '';
        if (this.state.success) {
            col = 'green';
        } else {
            col = '#EF476F';
        }
        let errorMessageStyle = {
            color: col,
        };

        if (this.state.redirect) {
            return <Redirect push to="/admin/login" />;
        }

        let bgStyle = {
            backgroundColor: '#f8fafd',
            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            margin: 'auto',
            marginTop: '10px',
            width: '60%',
            padding: '1em',
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

        let divStyle = {
            height: '100%',
            minHeight: window.innerHeight,
            width: window.innerWidth * 0.75,
            backgroundColor: '#f5f7fa',
            borderRadius: '5px',
            border: 'transparent',
            textAlign: 'center',
        };

        let textStyle = {
            color: '#093145',
            fontSize: '18px',
            marginBottom: '5px',
            fontWeight: 'bold',
        };
        var errorMessage = (
            <div style={errorMessageStyle}>{this.state.message}</div>
        );
        //after a game is created, the admin is redirected to the dashboard page
        if (this.state.success) {
            return (
                <Redirect
                    to={`/admin/dashboard/` + this.state.gameCode + `/new`}
                />
            );
        }

        var gameInfoText = null;

        if (this.state.type === '1') {
            gameInfoText = (
                <div>
                    <br></br>
                    <p>
                        This game has students collaborating to find estimations
                        for fun, mind-boggling questions. The closer their
                        estimation, the more points they win. Oh, and of course,
                        no calculators or internet allowed!
                        <br />
                        <br />
                        This game was inspired by the{' '}
                        <a
                            href="https://estimathon.com/about"
                            style={{
                                textDecoration: 'underline',
                                color: '#118AB2',
                            }}
                            target="_blank"
                        >
                            Estimathon.
                        </a>
                    </p>
                </div>
            );
        } else if (this.state.type === '2') {
            gameInfoText = (
                <p>
                    <br></br>
                    This is a review game with multiple choice and single answer
                    questions. Teams earn points by getting correct answers, and
                    the team with the most amount of points at the end wins!
                </p>
            );
        }

        return (
            <div className="AppAdmin" style={{ height: '100%' }}>
                <div style={{ backgroundColor: 'black', width: '100%' }}>
                    <Navbar fixed="top" variant="dark" className="nav-bar">
                        <h5 className="nav-header-game">New Game</h5>
                        <Nav className="mr-auto"></Nav>
                        <Form inline>
                            <Link to="/admin/dashboard">
                                <button
                                    className={'red-btn'}
                                    style={{ width: '110px' }}
                                >
                                    Back
                                </button>
                            </Link>
                        </Form>
                    </Navbar>
                </div>
                <br></br>
                <br></br>
                <br></br>

                <div style={divStyle} className="center">
                    <br />

                    <h1 className="titleStyle1" style={{ fontWeight: 'bold' }}>
                        Create New Game
                    </h1>

                    <br />
                    <Divider></Divider>
                    <br />
                    <div style={bgStyle}>
                        <Card.Text style={textStyle}>Game Name</Card.Text>
                        <input
                            placeholder="Enter the name"
                            style={{
                                width: '50%',
                                textAlign: 'center',
                                border: '1px solid #ccc',
                            }}
                            type="text"
                            name="name"
                            onChange={this.valueChanged}
                            value={this.state.name}
                        ></input>
                    </div>
                    <div style={bgStyle}>
                        <Card.Text style={textStyle}>Game Code:</Card.Text>
                        <p>
                            Students will use this code will be used to join
                            this game.
                        </p>
                        <input
                            maxLength={4}
                            placeholder="4 digits, numbers and characters"
                            style={{
                                width: '50%',
                                textAlign: 'center',
                                border: '1px solid #ccc',
                            }}
                            type="text"
                            name="gameCode"
                            onChange={this.valueChanged}
                            value={this.state.gameCode}
                        ></input>
                    </div>
                    <div style={bgStyle}>
                        <Card.Text style={textStyle}>Game Type</Card.Text>

                        <Form.Control
                            style={{
                                width: 'fit-content',
                                textAlign: 'center',
                                margin: 'auto',
                            }}
                            name="type"
                            onChange={this.valueChanged}
                            label="Select Game Type"
                            as="select"
                        >
                            <option value="" selected disabled hidden>
                                Select a Game Type
                            </option>
                            <option key={0} value={1}>
                                Estimation Game
                            </option>
                            <option key={1} value={2}>
                                Review Game
                            </option>
                        </Form.Control>
                        {gameInfoText}
                    </div>

                    {/*                         
                        <div className='row2' >
                            <div className='rows2' style={bgStyle2}>
                                <Card.Text style={textStyle}>
                                    Start Time
                                </Card.Text>
                                <div>
                                    <TimePicker start="0:00" end="23:59" step={5} name = "timeStart" onChange={this.handleStartTimeChange} value={this.state.timeStart} />
                                </div>
                                <br/>
                                <Card.Text style={textStyle}>
                                    Start Date
                                </Card.Text>
                                <input type="date" value ={this.state.startDate} onChange={this.valueChanged}  name = "startDate" className="form-control"></input>
                            </div>

                            <div className='rows2' style={bgStyle}>
                            <Card.Text style={textStyle}>
                                Time Zone: {getTimezoneName()}
                            </Card.Text>
                                <Card.Text style={textStyle}>
                                   Duration
                                </Card.Text>
                                <p>Click below to quickly set the end time/date.</p>
                                <br/>
                                <div style={{width:"100%"}}>

                                    <button className='trans-blue-btn margin small1' onClick={() => this.changeTiming(15)}> 15 Min</button>

                                    <button className='trans-blue-btn margin small1' onClick={() => this.changeTiming(30)}> 30 Min</button>

                                    <button className='trans-blue-btn margin small1' onClick={() => this.changeTiming(60)}> 1 Hour</button>

<br/>
                                      </div>
                                <br/>
                                   </div>


                            <div className='rows2' style={bgStyle2}>
                                <Card.Text style={textStyle}>
                                    End Time
                                </Card.Text>
                                <div>
                                    <TimePicker  start="0:00" end="23:59" step={5} name = "timeEnded" value={this.state.timeEnded} onChange={this.handleEndTimeChange}/>
                                </div>
                                <br/>
                                <Card.Text style={textStyle}>
                                    End Date
                                </Card.Text>
                                <input  type="date" value ={this.state.endDate} onChange={this.valueChanged} name = "endDate" className="form-control"></input>
                            </div>
                        </div>
                        <div style={bgStyle}>
                            <Card.Text style={textStyle}>
                                Max Number of Total Guesses
                            </Card.Text>
                            <p>Teams use up a guess when answering a question.</p>
                            <input placeholder="Enter a number" min={1} max={100} style={{width:'50%', textAlign:'center', border: '1px solid #ccc'}} type="number"  name = "guesses" onChange={this.valueChanged} value={this.state.guesses}></input>
                        </div>

                        <div style={bgStyle}>
                            <Card.Text style={textStyle}>
                                Max Number of People Per Team
                            </Card.Text>
                            <p>This only applies when students are joining teams.</p>
                            <input placeholder="Enter a number" min={1} max={100} style={{width:'50%', textAlign:'center', border: '1px solid #ccc'}} type="number"  name = "maxPerTeam" onChange={this.valueChanged} value={this.state.maxPerTeam}></input>
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
                                        checked={this.state.studentFreedom === "1"}
                                        onChange={this.onValueChange}
                                    />
                                    &nbsp;&nbsp;  Students can't do anything
                                </label>
                            </div>
                            <div className="radio">
                                <label>
                                    <input
                                        type="radio"
                                        value="2"
                                        checked={this.state.studentFreedom === "2"}
                                        onChange={this.onValueChange}
                                    />
                                    &nbsp;&nbsp;    Students can join and leave teams
                                </label>
                            </div>
                            <div className="radio">
                                <label>
                                    <input
                                        type="radio"
                                        value="3"
                                        checked={this.state.studentFreedom === "3"}
                                        onChange={this.onValueChange}
                                    />
                                    &nbsp;&nbsp;    Students can join, create, and leave teams
                                </label>
                            </div>

                        </div>

                        <div style={bgStyle}>
                            <Card.Text style={textStyle}>
                                Scoreboard Visibility
                            </Card.Text>

                            <p>This will be defaulted to all teams when you create the game. You can edit this later.</p> </div>

                            <div style={bgStyle}>
                            <Card.Text style={textStyle}>
                            Add Teachers
                            </Card.Text>

                            <p style = {{width: "60%", margin: "0 auto"}}>After creating this game, you will be able to add other teachers to your game. They will also be 
                                able to add questions, manage teams, and view the live scoreboard.</p> </div>
                         */}
                    {errorMessage}
                    <br />
                    <button
                        className="light-green-btn"
                        style={{ width: '300px' }}
                        onClick={this.createGame}
                    >
                        Create Game
                    </button>
                    <br />
                </div>
            </div>
        );
    }
}

export default NewGame;
