import React from 'react';
import '../../style/index.css';
import '../../style/buttons.css';
import Questions from './components/questions';
import Settings from './components/homesettings';
import { DashboardLayout } from './components/Layout';
import Scoreboard from './components/scoreboard';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { studentRequest } from '../Request';
import Submit from './modals/submitmodal';
import RulesModal from './modals/rulesmodal';
import FeedbackModal from './modals/feedbackmodal';
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';
import socketIOClient from 'socket.io-client';
import { url } from '../Request';
import swal from 'sweetalert';
import Divider from '@material-ui/core/Divider';
import { timeToServer, getDateObject } from '../Date';

var socket;
const ENDPOINT = url;

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.getGameData = this.getGameData.bind(this);
        this.getScore = this.getScore.bind(this);
        this.changeState = this.changeState.bind(this);
        this.changeModal = this.changeModal.bind(this);
        this.timeUp = this.timeUp.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
        this.showSubmitQuestionModal = this.showSubmitQuestionModal.bind(this);
        this.updateGuesses = this.updateGuesses.bind(this);
        this.updateLoaded = this.updateLoaded.bind(this); // because loaded needs a special function of its own hee hee
        this.updateState = this.updateState.bind(this);

        this.state = {
            questions: [],
            rawQuestions: [],
            settings: {
                start: '',
                end: '',
                totalGuesses: 0,
                gameName: '',
                totalQuestions: 0,
                scoreVisibility: {},
                type: '',
            },
            state: 1, //0 is scoreboard, 1 is questions, 2 is settings
            loaded: false,
            answerModal: false,
            rulesModal: false,
            feedbackModal: false,
            timeUp: false,
            newTime: '',
            color: '#06D6A0',
            message: '',
            timeout: null,
            dayState: '',
            hourState: '',
            minuteState: '',
            secondState: '',
            questionNum: 1, //this number will be passed into the submit answer modal. it represents the question number (starting at 1)
            guesses: 0, // guess count that is displayed in the side navbar
            notification: '',
            place: 1,
            imageURL: null,
        };

        socket = socketIOClient(ENDPOINT);

        //notify that you wish to monitor the score
        socket.emit(
            'joinGame',
            this.props.gameCode,
            this.props.studentTeam,
            false,
        );
    }

    updateGuesses(num) {
        this.state.guesses = num;
        this.setState(this.state);
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    updateLoaded() {
        this.state['loaded'] = true;
        this.setState(this.state);
    }

    componentWillUnmount() {
        //turn off listeners
        socket.off('scoreTable');
        socket.off('singleTeamTable');
        socket.off('place');
        socket.off('notification');
        console.log('disconnected');
        //disconnect socket
        socket.disconnect();
    }

    componentDidMount() {
        this.changeState(1);
        this.updateTimer();

        //listener for a notification from the admin
        socket.on('notification', (data) => {
            this.state['notification'] = data;
            this.setState(this.state);

            setTimeout(() => {
                this.state['notification'] = '';
                this.setState(this.state);
            }, 10000);
        });
    }

    updateTimer() {
        if (
            this.state.settings.start === '' ||
            this.state.settings.end === ''
        ) {
            this.timeoutId = setTimeout(() => {
                this.updateTimer();
            }, 1000);
            return;
        }

        var start = getDateObject(this.state.settings.start);
        var stop = getDateObject(this.state.settings.end);
        var now = new Date().getTime();

        if (now < start) {
            //game hasn't started

            // Find the distance between now and the count down date
            var distance = start - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            var minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60),
            );
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            var t =
                days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';

            this.setState({
                newTime: 'Time before Kontest starts: ',
                message: 'Stay patient, we are almost at the start!',
                color: '#06D6A0',
                dayState: days,
                hourState: hours,
                minuteState: minutes,
                secondState: seconds,
            });

            this.timeoutId = setTimeout(() => {
                this.updateTimer();
            }, 1000);
        } else if (now >= start && now <= stop) {
            //game going on

            // Find the distance between now and the count down date
            var distance = stop - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            var minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60),
            );
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            var t =
                days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';

            if (days.toString().length === 1) {
                this.state['dayState'] = '0' + days;
            } else {
                this.state['dayState'] = days;
            }

            if (hours.toString().length === 1) {
                this.state['hourState'] = '0' + hours;
            } else {
                this.state['hourState'] = hours;
            }

            if (minutes.toString().length === 1) {
                this.state['minuteState'] = '0' + minutes;
            } else {
                this.state['minuteState'] = minutes;
            }

            if (seconds.toString().length < 2) {
                this.state['secondState'] = '0' + seconds;
            } else {
                this.state['secondState'] = seconds;
            }

            if (distance / 1000 < 5 * 60) {
                this.state['color'] = '#ef476f';
            } else {
                this.state['color'] = 'white';
            }

            if (
                !this.displayInstructions &&
                localStorage.getItem('sawInstructions') != 'true'
            ) {
                this.state['rulesModal'] = true;
                this.displayInstructions = true;
                localStorage.setItem('sawInstructions', 'true');
            }

            this.setState(this.state);

            this.timeoutId = setTimeout(() => {
                this.updateTimer();
            }, 1000);
        } else {
            //game over
            this.state['message'] = 'Game Over';
            this.setState(this.state);

            if (!this.displayAnswers) {
                this.timeUp();
                this.displayAnswers = true;
            }
        }
    }

    /**
     * called when time is up. triggers game over and gets question answers
     */
    timeUp() {
        this.state['feedbackModal'] = true;
        this.state['rulesModal'] = false;
        this.state['timeUp'] = true;

        this.getGameData(1);

        this.setState(this.state);
    }

    changeModal(name, show) {
        this.state[name] = show;
        this.setState(this.state);
    }

    showSubmitQuestionModal(questionNum, imageURL) {
        this.state['questionNum'] = questionNum;
        this.state['imageURL'] = imageURL;
        this.state['answerModal'] = true;
        this.setState(this.state);
    }

    getGameData(newState) {
        studentRequest(
            'game/getGameData',
            'GET',
            this.props.gameCode,
            {},
            (d) => {
                //success
                if (d.success) {
                    var q = [];

                    if ('questions' in d.data) {
                        for (var i = 0; i < d.data.questions.length; i++) {
                            if ('answer' in d.data.questions[i]) {
                                q.push({
                                    q: d.data.questions[i].question,
                                    a: d.data.questions[i].answer,
                                    type: d.data.questions[i].type,
                                    choices: d.data.questions[i].choices,
                                    multiplier: d.data.questions[i].multiplier,
                                    image: d.data.questions[i].image,
                                });
                            } else {
                                q.push({
                                    q: d.data.questions[i].question,
                                    image: d.data.questions[i].image,
                                });
                            }
                        }
                    }

                    let curr = this.state;

                    let timeOffset = d.offset;

                    curr['rawQuestions'] = d.data.questions;
                    curr['questions'] = q;
                    curr['settings'] = {
                        start: timeToServer(timeOffset, d.data.start, true),
                        end: timeToServer(timeOffset, d.data.end, true),
                        totalGuesses: d.data.guesses,
                        gameName: d.data.name,
                        totalQuestions: d.data.numQuestions,
                        scoreVisibility: d.data.scoreVisibility,
                        type: d.data.type,
                    };

                    curr['state'] = newState;
                    this.setState(curr);
                    this.updateLoaded();
                } else {
                    swal(d.message, '', 'error');
                }
            },
        );
    }

    getScore(newState) {
        var curr = this.state;
        curr['state'] = newState;
        this.setState(curr);
    }

    /**
     * change between questions, scoreboard, and game rules
     * @param newState
     */

    changeState(newState) {
        if (newState === 0) {
            this.getScore(newState);
        } else {
            this.getGameData(newState);
        }
    }

    render() {
        var body = null;

        if (this.state.state === 0) {
            body = (
                <Scoreboard
                    updateState={this.updateState}
                    updateGuesses={this.updateGuesses}
                    updateLoaded={this.updateLoaded}
                    numScores={this.state.settings.scoreVisibility.num}
                    gameCode={this.props.gameCode}
                    refresh={() => this.getScore(0)}
                />
            );
        } else if (this.state.state === 1) {
            body = (
                <Questions
                    updateState={this.updateState}
                    updateLoaded={this.updateLoaded}
                    updateGuesses={this.updateGuesses}
                    showSubmitQuestionModal={this.showSubmitQuestionModal}
                    teamName={this.props.studentTeam}
                    gameCode={this.props.gameCode}
                    questions={this.state.questions}
                ></Questions>
            );
        } else if (this.state.state === 2) {
            body = <Settings settings={this.state.settings}></Settings>;
        }

        var notificationBox = (
            <div
                className={
                    (this.state.notification != '' ? 'fadeIn' : 'fadeOut') +
                    ' notification-box'
                }
            >
                <b>{this.state.notification}</b>
            </div>
        );

        return (
            <DashboardLayout
                place={this.state.place}
                loaded={this.state.loaded}
                guessCount={this.state.guesses}
                totalGuesses={this.state.settings.totalGuesses}
                rules={() => this.changeModal('rulesModal', true)}
                exit={() => this.props.changePage(0)}
                questions={() => this.changeState(1)}
                scoreboard={() => this.changeState(0)}
                settings={() => this.changeState(2)}
            >
                {notificationBox}

                <div className={'AppGamePage'}>
                    <div>
                        <Navbar fixed="top" variant="dark" className="nav-bar">
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

                            <Nav className="mr-auto text-center"></Nav>

                            {this.state.questions.length > 0 &&
                            !this.state.timeUp ? (
                                <div>
                                    <h1
                                        className="big"
                                        style={{ color: this.state.color }}
                                    >
                                        {this.state.dayState}:
                                        {this.state.hourState}:
                                        {this.state.minuteState}:
                                        {this.state.secondState}
                                    </h1>
                                </div>
                            ) : (
                                <h1 className="red-big">Game Over!</h1>
                            )}
                        </Navbar>
                    </div>
                    <br></br>
                    <br></br>
                    <br></br>
                    <div style={{ textAlign: 'center' }}>{body}</div>

                    <br></br>

                    {this.state.answerModal && !this.state.timeUp ? (
                        <Submit
                            imageURL={this.state.imageURL}
                            questionNum={this.state.questionNum}
                            studentName={this.props.studentName}
                            studentTeam={this.props.studentTeam}
                            gameCode={this.props.gameCode}
                            questions={this.state.rawQuestions}
                            refreshScoreboard={() =>
                                this.getScore(this.state.state)
                            }
                            showModal={this.state.answerModal}
                            hideModal={() =>
                                this.changeModal('answerModal', false)
                            }
                        />
                    ) : null}

                    <RulesModal
                        type={this.state.settings.type}
                        showModal={this.state.rulesModal}
                        hideModal={() => this.changeModal('rulesModal', false)}
                    />
                    <FeedbackModal
                        place={this.state.place}
                        showModal={this.state.feedbackModal}
                        hideModal={() =>
                            this.changeModal('feedbackModal', false)
                        }
                    />
                </div>
            </DashboardLayout>
        );
    }
}

export { Game, socket };
