import React from 'react';
import Card from 'react-bootstrap/Card';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import '../../style/index.css';
import '../../style/buttons.css';
import { studentRequest } from '../Request';
import StudentPopup from './modals/studentpopup';
import Divider from '@material-ui/core/Divider';
import Timer from './components/timer';
import RulesModal from './modals/rulesmodal';
import '../../style/index.css';
import swal from 'sweetalert';
import Teams from './components/teams';
import { DashboardLayout } from './components/Layout';
import { timeToServer } from '../Date';

class Student extends React.Component {
    constructor(props) {
        super(props);

        this.changeState = this.changeState.bind(this);
        this.updateState = this.updateState.bind(this);
        this.valueChanged = this.valueChanged.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.showModal = this.showModal.bind(this);
        this.showTeam = this.showTeam.bind(this);
        this.leaveTeam = this.leaveTeam.bind(this);
        this.submitName = this.submitName.bind(this);
        this.getGameSettings = this.getGameSettings.bind(this);
        this.showPlayGame = this.showPlayGame.bind(this);
        this.updateModal = this.updateModal.bind(this);
        this.changeStudentId = this.changeStudentId.bind(this);
        this.setTeamName = this.setTeamName.bind(this);

        this.state = {
            state: 1,
            studentName: this.props.studentName,
            studentId: this.props.studentId || '',
            teamName: '',
            teammates: [],
            studentModal: false,
            exists: false,
            studentFreedom: 1,
            settings: {},
            playGame: false,
            showRules: false,
            timeToGo: false, // has the game started yet?
        };
    }

    componentDidMount() {
        this.submitName();
    }

    getGameSettings(prevState) {
        studentRequest(
            'game/getGameData',
            'GET',
            this.props.gameCode,
            {},
            (d) => {
                //success
                if (d.success) {
                    //convert the date

                    let timeOffset = d.offset;

                    prevState['settings'] = {
                        start: timeToServer(timeOffset, d.data.start, true),
                        end: timeToServer(timeOffset, d.data.end, true),
                        totalGuesses: d.data.guesses,
                        gameName: d.data.name,
                        totalQuestions: d.data.numQuestions,
                        type: d.data.type,
                        maxPerTeam: d.data.maxPerTeam,
                    };

                    this.setState(prevState);
                } else {
                    swal('Error', 'Please refresh the page!', 'error');
                }
            },
        );
    }

    hideModal() {
        this.state['studentModal'] = false;
        this.setState(this.state);
    }

    showModal(teamExists) {
        this.state['studentModal'] = true;
        this.state['exists'] = teamExists;

        this.setState(this.state);
    }

    submitName() {
        studentRequest(
            'students/get',
            'POST',
            this.props.gameCode,
            {
                studentName: this.state.studentName,
                studentId: this.state.studentId,
            },
            (d) => {
                if (d.success) {
                    var curr = this.state;

                    if (d.hasTeam) {
                        localStorage.setItem('teamName', d.teamName);

                        curr['state'] = 2;
                        curr['teamName'] = d.teamName;
                        curr['teammates'] = d.teamMembers;
                        curr['studentModal'] = false;
                        curr['exists'] = false;
                        curr['studentFreedom'] = d.studentFreedom;
                    } else {
                        curr['state'] = 1;
                        curr['teamName'] = '';
                        curr['teammates'] = d.teamMembers;
                        curr['studentModal'] = false;
                        curr['exists'] = false;
                        curr['studentFreedom'] = d.studentFreedom;
                    }

                    this.getGameSettings(curr);
                } else {
                    swal('Error', d.message, 'error');
                    localStorage.removeItem('studentName');
                    localStorage.removeItem('gameCode');
                    localStorage.removeItem('studentId');
                    this.props.changePage(0);
                }
            },
        );
    }

    changeStudentId() {
        let teamName = this.state.teamName;

        if (teamName != '') {
            let newID = this.state.studentId;

            studentRequest(
                'students/updateStudentId',
                'POST',
                this.props.gameCode,
                {
                    studentName: this.state.studentName,
                    studentId: newID,
                    newTeam: teamName,
                    isNew: false,
                },
                (d) => {
                    if (d.success) {
                        swal(
                            'Your student id has been updated!',
                            '',
                            'success',
                        );
                        //update local storage
                        localStorage.setItem('studentId', newID);
                    } else {
                        swal(d.message, '', 'error');
                    }
                },
            );
        } else {
            swal(
                'Please join a team before changing your student ID!',
                '',
                'info',
            );
        }
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    showTeam() {
        this.submitName();
    }

    leaveTeam() {
        studentRequest(
            'students/delete',
            'DELETE',
            this.props.gameCode,
            {
                studentName: this.state.studentName,
                previousTeam: this.state.teamName,
            },
            (d) => {
                swal(d.message, '', 'info');

                localStorage.removeItem('teamName');
                if (d.success) {
                    this.submitName();
                }
            },
        );
    }

    showPlayGame() {
        //show the play game button now

        let curr = this.state;
        curr['playGame'] = true;
        curr['timeToGo'] = true;
        this.setState(curr);
    }

    updateModal(showModal, whichModal) {
        if (whichModal === 'rules') {
            this.state['showRules'] = showModal;
            this.setState(this.state);
        } else if (whichModal === 'team') {
            this.state['teamInstructionsModal'] = showModal;
            this.setState(this.state);
        }
    }

    changeState(newState) {
        this.updateState('state', newState);
    }
    setTeamName(name) {
        this.updateState('teamName', name);

        if (name != '' && this.state.timeToGo) {
            this.showPlayGame();
        }
    }

    render() {
        let divStyle = {
            backgroundColor: '#f8fafd',
            borderColor: '#dfe3e6',
            boxShadow: '-1px 1px 30px 16px #ced2d5',

            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            width: '35vw',
        };

        let messageStyle = {
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'black',
        };

        var studentModal = null;
        if (this.state.studentModal) {
            studentModal = (
                <StudentPopup
                    setTeamName={this.setTeamName}
                    gameCode={this.props.gameCode}
                    studentId={this.state.studentId}
                    studentName={this.state.studentName}
                    showTeam={this.showTeam}
                    joinTeam={this.state.exists}
                    hideModal={this.hideModal}
                    refreshQuestions={this.props.refreshQuestions}
                />
            );
        }

        //Display settings

        var timer = null;
        var gameSettings = null;

        let gameType = '';

        if (parseInt(this.state.settings.type) === 1) {
            gameType = 'Estimation Game';
        } else if (parseInt(this.state.settings.type) === 2) {
            gameType = 'Review Game';
        }

        if (this.state.settings.start && this.state.settings.end) {
            timer = (
                <Timer
                    showPlayGame={this.showPlayGame}
                    start={this.state.settings.start}
                    stop={this.state.settings.end}
                />
            );
            gameSettings = (
                <div className="rows2" style={{ width: '90%' }}>
                    <h5 className="subhead">Settings</h5>

                    <br />
                    <p>
                        Guesses Allowed:{' '}
                        <b>{this.state.settings.totalGuesses}</b>
                    </p>
                    <p>
                        Total Questions:{' '}
                        <b>{this.state.settings.totalQuestions}</b>
                    </p>
                    <p>
                        Game Type:<b> {gameType}</b>
                    </p>
                    <br />

                    <div className="form-group">
                        <button
                            className="blue-btn small1"
                            onClick={() => this.updateModal(true, 'rules')}
                            style={{ width: '100%' }}
                        >
                            {' '}
                            How to play{' '}
                        </button>
                    </div>
                </div>
            );
        }

        var playGame = null;

        //student can play the game if they have a team and the game has started
        if (this.state.playGame) {
            if (this.state.teamName != '') {
                playGame = (
                    <button
                        className="light-green-btn small1"
                        onClick={() => this.props.playGame(this.state.teamName)}
                    >
                        Join Game
                    </button>
                );
            } else {
                playGame = (
                    <p className="titleStyle2">
                        Please join a team to play the game.
                    </p>
                );
            }
        }

        let navTitle = '';

        if (this.state.settings.gameName) {
            navTitle = 'Kontest - ' + this.state.settings.gameName;
        }

        let changeId = (
            <div className="rows2">
                <h5 className="subhead">Your Info</h5>
                <br />
                <p>Name: {this.state.studentName}</p>
                <br />
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        style={{ textAlign: 'center' }}
                        name="studentId"
                        value={this.state.studentId}
                        placeholder="Enter student id"
                        onChange={this.valueChanged}
                    />
                </div>

                <div className="form-group">
                    <button
                        className="blue-btn"
                        style={{ width: '100%' }}
                        onClick={this.changeStudentId}
                    >
                        Update Id
                    </button>
                </div>
            </div>
        );

        return (
            <div className={'App'}>
                <Navbar className="nav-bar" fixed="top">
                    <h5 className="nav-header-game">Kontest</h5>

                    <Divider
                        orientation="vertical"
                        style={{ background: '#05192a' }}
                        flexItem
                    ></Divider>

                    <h5 className="nav-header-game titleStyle7">
                        {' '}
                        {this.state.settings.gameName}
                    </h5>

                    <h5
                        className="nav-header-game"
                        style={{ color: '#06d6a0' }}
                    >
                        Code: {this.props.gameCode}
                    </h5>

                    <Nav className="mr-auto"></Nav>

                    <Form inline>
                        <button
                            className="red-btn"
                            onClick={() => this.props.changePage(0)}
                        >
                            Exit Game
                        </button>
                    </Form>
                </Navbar>

                <div
                    className="inner-div bottom-fixed split left"
                    style={divStyle}
                >
                    <br></br>
                    <br></br>
                    <br></br>
                    <br />

                    {timer}

                    {playGame}
                    <br />
                    <br />

                    <Divider></Divider>
                    {gameSettings}
                    <Divider></Divider>
                    {changeId}
                </div>

                {studentModal}
                <RulesModal
                    showModal={this.state.showRules}
                    type={this.state.settings.type || ''}
                    hideModal={() => this.updateModal(false, 'rules')}
                />
                {/* <TeamInstructionsModal studentFreedom ={this.state.studentFreedom} showModal = {this.state.teamInstructionsModal} hideModal = {() => this.updateModal(false, 'team')}></TeamInstructionsModal> */}

                <div className="split right" style={{ width: '65vw' }}>
                    <Teams
                        maxPerTeam={this.state.settings.maxPerTeam}
                        setTeamName={this.setTeamName}
                        studentName={this.state.studentName}
                        studentId={this.state.studentId}
                        leaveTeam={this.leaveTeam}
                        showCreateTeamsModal={() => this.showModal(false)}
                        teamName={this.state.teamName}
                        gameCode={this.props.gameCode}
                        studentFreedom={this.state.studentFreedom}
                    ></Teams>
                </div>
            </div>
        );
    }
}

export default Student;
