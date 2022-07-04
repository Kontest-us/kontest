import React from 'react';
import '../../style/index.css';
import '../../style/buttons.css';
import GameCode from './components/gamecode';
import StudentName from './components/studentname';
import StudentId from './components/studentid';
import Student from './Student';
import { Game } from './Game';
import { withRouter } from 'react-router-dom';
import { studentRequest } from '../Request';
import swal from 'sweetalert';

class Play extends React.Component {
    constructor(props) {
        super(props);

        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.enterGameCode = this.enterGameCode.bind(this);
        this.getStudentTeam = this.getStudentTeam.bind(this);
        this.playGame = this.playGame.bind(this);
        this.joinOldGame = this.joinOldGame.bind(this);
        this.changePage = this.changePage.bind(this);
        this.checkStudent = this.checkStudent.bind(this);
        this.playSampleGame = this.playSampleGame.bind(this);

        var isSample = this.props.match['params']['sample'] == 'sample';

        this.state = {
            gameCode: '',
            success: true,
            message: '',
            studentName: '',
            id: '',
            studentTeam: '',
            gameName: '',
            state: 0,
            isSample: isSample,
            //0: waiting to enter code
            //1: waiting to enter name
            //2: enter student id/password
            //3: student team page
            //4: game itself
        };
    }

    playSampleGame(gameCode) {
        this.updateState('gameCode', gameCode);
        this.enterGameCode();
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        if (key === 'gameCode') {
            //make the game code uppercase
            val = val.toUpperCase();
            //remove spaces
            val = val.replace(/ /g, '');
        }

        this.state[key] = val;
        this.setState(this.state);
    }

    changePage(newPage) {
        this.state['state'] = newPage;
        this.setState(this.state);
    }

    enterGameCode() {
        let gameCode = this.state.gameCode;

        if (gameCode.length === 0) {
            let currState = this.state;
            currState['message'] = 'Please enter a game code.';
            currState['success'] = false;

            //success
            this.setState(currState);
        } else {
            //check if this is a valid gamecode
            studentRequest('game/checkLive', 'POST', gameCode, {}, (d) => {
                if (!d.success) {
                    //bad code
                    let currState = this.state;
                    currState['message'] = d.message;
                    currState['success'] = d.success;

                    //success
                    this.setState(currState);
                } else {
                    //good code, can enter name now
                    let currState = this.state;
                    currState['message'] = '';
                    currState['success'] = d.success;
                    currState['state'] = 1;
                    currState['gameName'] = d.data;

                    //success
                    this.setState(currState);
                }
            });
        }
    }

    checkStudent() {
        let gameCode = this.state.gameCode;
        let studentName = this.state.studentName;

        //remove spaces after the last character in studentName
        studentName = studentName.replace(/\s*$/, '');

        //remove all spaces in the game code
        gameCode = gameCode.replace(/ /g, '');

        //check if this is a valid gamecode
        studentRequest(
            'students/check',
            'POST',
            gameCode,
            {
                name: studentName,
            },
            (d) => {
                if (!d.success) {
                    //bad code
                    let currState = this.state;
                    currState['message'] = d.message;
                    currState['success'] = d.success;
                    currState['studentName'] = studentName;

                    //show error message
                    this.setState(currState);
                } else {
                    //good code, can enter name now
                    let currState = this.state;
                    currState['message'] = d.message;
                    currState['success'] = d.success;
                    currState['studentName'] = studentName;

                    //if the database doesn't have an id for this kid, automatically set it to "" on the frontend
                    if (!d.showId) {
                        currState['id'] = '';
                    }
                    currState['state'] = d.showId ? 2 : 3;

                    this.setState(currState);
                }
            },
        );
    }

    joinOldGame(studentName, gameCode, studentId) {
        //first, make sure the game is active

        //remove all spaces in the game code
        gameCode = gameCode.replace(/ /g, '');

        //check if this is a valid gamecode
        studentRequest('game/checkLive', 'POST', gameCode, {}, (d) => {
            if (!d.success) {
                //bad code
                let currState = this.state;
                currState['message'] = d.message;
                currState['success'] = d.success;

                //success
                this.setState(currState);
            } else {
                //good code

                //update local storage

                //local storage will be accessed in other parts of the site
                localStorage.setItem('studentName', studentName);
                localStorage.setItem('gameCode', gameCode);
                localStorage.setItem('studentId', studentId);

                //can go to the student team page now

                let currState = this.state;
                currState['message'] = '';
                currState['success'] = d.success;
                currState['state'] = 3;
                currState['gameName'] = d.data;
                currState['gameCode'] = gameCode;
                currState['studentName'] = studentName;
                currState['id'] = studentId;

                //success
                this.setState(currState);
            }
        });
    }

    getStudentTeam() {
        //update local storage

        //local storage will be accessed in other parts of the site
        localStorage.setItem('studentName', this.state.studentName);
        localStorage.setItem('gameCode', this.state.gameCode);
        localStorage.setItem('studentId', this.state.id);

        //show team page

        let currState = this.state;
        currState['state'] = 3;

        //success
        this.setState(currState);
    }

    componentDidMount() {}

    playGame(studentTeam) {
        let currState = this.state;
        currState['state'] = 4;
        currState['studentTeam'] = studentTeam;

        //success
        this.setState(currState);
    }

    render() {
        let navStyle = {
            width: '100%',
            textAlign: 'center',
        };

        let errorBox = null;

        var color = '#EF476F';
        if (this.state.success) {
            color = 'transparent';
        }

        if (this.state.message != '') {
            let errorBoxStyle = {
                position: 'fixed',
                width: '75%',
                margin: 'auto',
                backgroundColor: color,
                color: 'white',
                fontSize: '20px',
                textAlign: 'center',
                top: '20px',
                padding: '10px',
                boxSizing: 'border-box',
                borderRadius: '8px',
                zIndex: '1000',
            };
            errorBox = <div style={errorBoxStyle}>{this.state.message}</div>;
        }

        switch (this.state.state) {
            case 0:
                /*
                Student needs to enter game code
                */
                return (
                    <GameCode
                        isSample={this.state.isSample}
                        playSampleGame={this.playSampleGame}
                        joinOldGame={this.joinOldGame}
                        gameCode={this.state.gameCode}
                        errorBox={errorBox}
                        valueChanged={this.valueChanged}
                        enterGameCode={this.enterGameCode}
                    ></GameCode>
                );

            case 1:
                /*
                Student needs to enter name
            */

                return (
                    <StudentName
                        goBack={() => this.updateState('state', 0)}
                        studentName={this.state.studentName}
                        errorBox={errorBox}
                        valueChanged={this.valueChanged}
                        gameName={this.state.gameName}
                        checkStudent={this.checkStudent}
                    ></StudentName>
                );
            case 2:
                /*
                Student needs to enter id
                */
                return (
                    <StudentId
                        goBack={() => this.updateState('state', 1)}
                        studentName={this.state.studentName}
                        errorBox={errorBox}
                        valueChanged={this.valueChanged}
                        gameName={this.state.gameName}
                        getStudentTeam={this.getStudentTeam}
                    />
                );

            case 3:
                return (
                    <Student
                        changePage={this.changePage}
                        studentId={this.state.id}
                        studentName={this.state.studentName}
                        gameCode={this.state.gameCode}
                        playGame={this.playGame}
                    ></Student>
                );
            case 4:
                return (
                    <Game
                        changePage={this.changePage}
                        studentName={this.state.studentName}
                        studentTeam={this.state.studentTeam}
                        gameCode={this.state.gameCode}
                    ></Game>
                );
            default:
                return <p>Hello</p>;
        }
    }
}

export default withRouter(Play);
