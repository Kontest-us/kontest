import React from 'react';
import '../../../style/index.css';
import '../../../style/buttons.css';
import '../../../style/extra.css';

import 'firebase/auth';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import TimePicker from 'react-bootstrap-time-picker';
import { getTimezoneName, getDateObject } from '../../Date';

class playpopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            next: 0,
        };
    }

    changeNext(next) {
        this.setState({
            ...this.state,
            next: next,
        });
    }

    render() {
        let bgStyle = {
            backgroundColor: '#f5f7fa',
            borderRadius: '10px',
            padding: '1em',
            margin: '2px',
            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
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

        let textStyle = {
            color: '#093145',
            fontSize: '18px',
            marginBottom: '5px',
            fontWeight: 'bold',
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
            height: '425px',
        };

        if (this.props.scoreVisibility['all']) {
            allDivStyle['backgroundColor'] = '#aaf0d1';
            numDivStyle['backgroundColor'] = '#f6f8fb';
            noneDivStyle['backgroundColor'] = '#f6f8fb';
        } else {
            if (this.props.scoreVisibility['num'] === 0) {
                allDivStyle['backgroundColor'] = '#f6f8fb';
                numDivStyle['backgroundColor'] = '#f6f8fb';
                noneDivStyle['backgroundColor'] = '#aaf0d1';
            } else {
                allDivStyle['backgroundColor'] = '#f6f8fb';
                numDivStyle['backgroundColor'] = '#aaf0d1';
                noneDivStyle['backgroundColor'] = '#f6f8fb';
            }
        }

        let startD = getDateObject(
            this.props.startDate + ' ' + this.props.timeStart,
        );
        let endD = getDateObject(
            this.props.endDate + ' ' + this.props.timeEnded,
        );

        let test = endD.getTime() - startD.getTime();

        var days = Math.floor(
            (test % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24),
        );

        var hours = Math.floor(
            (test % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );

        var minutes = Math.floor((test % (1000 * 60 * 60)) / (1000 * 60));

        let durationString = '';

        if (days == 1) {
            durationString += days + ' day,';
        } else if (days > 1) {
            durationString += days + ' days,';
        }

        if (hours == 1) {
            durationString += ' ' + hours + ' hour,';
        } else if (hours > 1) {
            durationString += ' ' + hours + ' hours,';
        }

        if (minutes == 1) {
            durationString += ' ' + minutes + ' minute,';
        } else if (minutes > 1) {
            durationString += ' ' + minutes + ' minutes,';
        }

        durationString = durationString.substring(0, durationString.length - 1);

        return (
            <Modal
                size="lg"
                show={true}
                backdrop="static"
                keyboard={false}
                dialogClassName="sideModal"
                onHide={() => this.props.hideModal()}
            >
                <Modal.Header
                    closeButton
                    style={{ textAlign: 'center', backgroundColor: '#f5f7fa' }}
                >
                    {this.state.next === 0 ? (
                        <h1
                            style={{
                                fontWeight: 'bold',
                                fontSize: '35px',
                                color: '#073b4c',
                            }}
                        >
                            Play Game - Set Game Time
                        </h1>
                    ) : (
                        <h1
                            style={{
                                fontWeight: 'bold',
                                fontSize: '35px',
                                color: '#073b4c',
                            }}
                        >
                            Play Game - Set Player Settings
                        </h1>
                    )}
                </Modal.Header>

                <Modal.Body
                    style={{ textAlign: 'center', backgroundColor: '#f5f7fa' }}
                >
                    {this.state.next === 0 ? (
                        <div>
                            <p className="special">
                                Current Duration: {durationString}
                            </p>

                            <div className="row2" id="section1">
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
                                                this.props.handleStartTimeChange
                                            }
                                            value={this.props.timeStart}
                                        />
                                    </div>
                                    <br />
                                    <Card.Text style={textStyle}>
                                        Start Date
                                    </Card.Text>

                                    <input
                                        type="date"
                                        value={this.props.startDate}
                                        onChange={this.props.valueChanged}
                                        name="startDate"
                                        className="form-control"
                                    ></input>
                                    <br />
                                    <br />
                                    <br />
                                    <button
                                        className="trans-blue-btn margin small1"
                                        onClick={this.props.setCurrentTime}
                                    >
                                        Set to Right Now
                                    </button>
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
                                            value={this.props.timeEnded}
                                            onChange={
                                                this.props.handleEndTimeChange
                                            }
                                        />
                                    </div>
                                    <br />
                                    <Card.Text style={textStyle}>
                                        End Date
                                    </Card.Text>
                                    <input
                                        type="date"
                                        value={this.props.endDate}
                                        onChange={this.props.valueChanged}
                                        name="endDate"
                                        className="form-control"
                                    ></input>
                                    <br></br>
                                    <p>
                                        Click below to set the duration of the
                                        game.
                                    </p>
                                    <br></br>
                                    <button
                                        className="trans-blue-btn"
                                        style={{ width: '50%' }}
                                        onClick={() =>
                                            this.props.changeTiming(5)
                                        }
                                    >
                                        {' '}
                                        5 Minutes
                                    </button>
                                    <button
                                        className="trans-blue-btn"
                                        style={{ width: '50%' }}
                                        onClick={() =>
                                            this.props.changeTiming(15)
                                        }
                                    >
                                        {' '}
                                        15 Minutes
                                    </button>
                                    <button
                                        className="trans-blue-btn"
                                        style={{ width: '50%' }}
                                        onClick={() =>
                                            this.props.changeTiming(30)
                                        }
                                    >
                                        {' '}
                                        30 Minutes
                                    </button>
                                    <button
                                        className="trans-blue-btn"
                                        style={{ width: '50%' }}
                                        onClick={() =>
                                            this.props.changeTiming(45)
                                        }
                                    >
                                        {' '}
                                        45 Minutes
                                    </button>
                                    <button
                                        className="trans-blue-btn"
                                        style={{ width: '50%' }}
                                        onClick={() =>
                                            this.props.changeTiming(60)
                                        }
                                    >
                                        {' '}
                                        1 Hour
                                    </button>
                                    <button
                                        className="trans-blue-btn"
                                        style={{ width: '50%' }}
                                        onClick={() =>
                                            this.props.changeTiming(90)
                                        }
                                    >
                                        {' '}
                                        90 Minutes
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div id="section2">
                            <div className="row2">
                                <div style={bgStyle} className="rows2">
                                    <Card.Text style={textStyle}>
                                        Max Number of Total Guesses
                                    </Card.Text>
                                    <p>
                                        Teams use up a guess when answering a
                                        question. Correct answers still count as
                                        guesses.
                                    </p>
                                    <br></br>
                                    <input
                                        placeholder="Enter a number"
                                        min={1}
                                        max={100}
                                        style={{
                                            width: '90%',
                                            textAlign: 'center',
                                            border: '1px solid #ccc',
                                        }}
                                        type="number"
                                        name="maxGuesses"
                                        onChange={this.props.valueChanged}
                                        value={this.props.maxGuesses}
                                    ></input>
                                </div>

                                <div style={bgStyle} className="rows2">
                                    <Card.Text style={textStyle}>
                                        Max Number of People Per Team
                                    </Card.Text>
                                    <p>
                                        This only applies when students are
                                        joining teams.
                                    </p>
                                    <br></br>
                                    <input
                                        placeholder="Enter a number"
                                        min={1}
                                        max={100}
                                        style={{
                                            width: '90%',
                                            textAlign: 'center',
                                            border: '1px solid #ccc',
                                        }}
                                        type="number"
                                        name="maxPerTeam"
                                        onChange={this.props.valueChanged}
                                        value={this.props.maxPerTeam}
                                    ></input>
                                </div>

                                <div className="rows2" style={bgStyle}>
                                    <Card.Text style={textStyle}>
                                        Student Permissions
                                    </Card.Text>

                                    <div
                                        className="radio"
                                        style={{ textAlign: 'left' }}
                                    >
                                        <label>
                                            <input
                                                type="radio"
                                                value="1"
                                                checked={
                                                    this.props
                                                        .studentFreedom === '1'
                                                }
                                                onChange={
                                                    this.props.onValueChange
                                                }
                                            />
                                            &nbsp;&nbsp; Students are already
                                            assigned to teams.
                                        </label>
                                    </div>
                                    <div
                                        className="radio"
                                        style={{ textAlign: 'left' }}
                                    >
                                        <label>
                                            <input
                                                type="radio"
                                                value="2"
                                                checked={
                                                    this.props
                                                        .studentFreedom === '2'
                                                }
                                                onChange={
                                                    this.props.onValueChange
                                                }
                                            />
                                            &nbsp;&nbsp; Students can join and
                                            leave teams.
                                        </label>
                                    </div>
                                    <div
                                        className="radio"
                                        style={{ textAlign: 'left' }}
                                    >
                                        <label>
                                            <input
                                                type="radio"
                                                value="3"
                                                checked={
                                                    this.props
                                                        .studentFreedom === '3'
                                                }
                                                onChange={
                                                    this.props.onValueChange
                                                }
                                            />
                                            &nbsp;&nbsp; Students can join,
                                            create, and leave teams.
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="rows" style={bgStyle}>
                                <Card.Text style={textStyle}>
                                    Scoreboard Visibility
                                </Card.Text>
                                <p>
                                    Click an option to change the scores shown
                                    to the players.
                                </p>
                                <button
                                    className="row"
                                    style={allDivStyle}
                                    onClick={() =>
                                        this.props.changeScoreVisibilityButton(
                                            true,
                                            this.props.numScoreInput,
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
                                        this.props.changeScoreVisibilityButton(
                                            false,
                                            this.props.numScoreInput,
                                        )
                                    }
                                >
                                    <Card.Text style={textStyle}>
                                        Show Top <br />
                                        <input
                                            disabled={this.props.disabled}
                                            placeholder="Enter a number"
                                            min={0}
                                            max={this.props.numTeams}
                                            style={{
                                                width: '50%',
                                                textAlign: 'center',
                                                border: '1px solid #ccc',
                                            }}
                                            type="number"
                                            name="numScoreInput"
                                            onChange={this.props.valueChanged}
                                            value={this.props.numScoreInput}
                                        ></input>
                                        Teams
                                    </Card.Text>
                                </button>

                                <button
                                    className="row"
                                    style={noneDivStyle}
                                    onClick={() =>
                                        this.props.changeScoreVisibilityButton(
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
                    )}

                    <br></br>

                    {this.state.next === 0 ? (
                        <button
                            className="dark-green-btn"
                            style={{ width: '300px' }}
                            onClick={() => this.changeNext(1)}
                        >
                            Continue
                        </button>
                    ) : (
                        <div>
                            <button
                                className="dark-green-btn"
                                style={{ width: '300px' }}
                                onClick={this.props.playGame}
                            >
                                Start Game
                            </button>
                            <br />
                            <br />
                            <button
                                className="red-btn"
                                style={{ width: '300px' }}
                                onClick={() => this.changeNext(0)}
                            >
                                Back
                            </button>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        );
    }
}

export default playpopup;
