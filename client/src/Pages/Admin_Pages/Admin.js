import React from 'react';
import { DashboardLayoutAdmin } from './components/LayoutAdmin';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import '../../style/index.css';
import '../../style/buttons.css';
import firebase from 'firebase/app';
import 'firebase/auth';

import { adminGameRequest } from '../Request';
import QuestionAnswer from './components/questionslist';
import Settings from './components/settings';
import Teams from './components/teamslist';
import AdminScoreboard from './components/adminscoreboard';
import Instructions from './components/instructions';
import { Redirect, Link } from 'react-router-dom';
import swal from 'sweetalert';
import { timeToServer } from '../Date';
import Divider from '@material-ui/core/Divider';
import ReactLoading from 'react-loading';

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.logOut = this.logOut.bind(this);
        this.changeState = this.changeState.bind(this);
        this.redirect = this.redirect.bind(this);
        this.updateState = this.updateState.bind(this);
        this.getScore = this.getScore.bind(this);
        this.getTime = this.getTime.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.getTeams = this.getTeams.bind(this);
        this.updateLive = this.updateLive.bind(this);
        this.continueIntro = this.continueIntro.bind(this);

        var isNew = this.props.match['params']['isNew'] == 'new';
        var startRightAway = this.props.match['params']['isNew'] == 'play';
        var seeResults = this.props.match['params']['isNew'] == 'live';

        let page = 0;
        if (isNew) {
            page = 1;
        } else if (seeResults) {
            page = 3;
        }

        this.state = {
            recievedData: false,
            params: this.props.match,
            redirect: {
                redirect: false,
                url: '/',
            },
            windowWidth: window.innerWidth,
            state: page, //0  settings, 1 is questions, 2 is teams, and 3 is live game update
            gameID: this.props.match['params']['gameid'],
            isDeleted: false,
            adminInfo: {},
            time: {
                start: '7/10/2021 10:00',
                end: '7/10/2021 12:00',
            },
            gameStatus: 1,
            gameType: 1, //1 is estimathon, 2 is review
            gameName: '',
            live: false,
            isFullScreen: isNew,
            isNew: isNew,
            adminStatus: 3,
            startRightAway: startRightAway,
        };
    }

    componentDidMount() {
        adminGameRequest(
            'game/getAdminStatus',
            'POST',
            this.state.gameID,
            {},
            (d) => {
                //success
                if (d.success) {
                    let status = d.data;
                    let curr = this.state;
                    let adminStatus = parseInt(status);
                    curr['adminStatus'] = adminStatus;

                    //redirect the user if the admins status is too high
                    if (curr['isNew'] && adminStatus >= 2) {
                        //only true when a new game is being created
                        curr['redirect']['redirect'] = true;
                    } else if (curr.state !== 0 && adminStatus >= 2) {
                        //will be called when the reader admin presses play from the game list
                        curr.state = 0;
                    }

                    this.getTime(curr, false);
                } else {
                    swal(d.message, '', 'error');
                    this.redirect();
                }
            },
        );
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    updateStatus(num) {
        this.updateState('gameStatus', num);
        if (num === 2) {
            this.getScore();
        }
    }

    continueIntro() {
        let currPage = this.state.state;
        if (currPage == 1) {
            //go to team page
            this.getTeams(false);
        } else if (currPage == 2) {
            //go to settings page
            this.changeState(0);
        } else {
            //go to live game page
            this.getScore();
        }
    }

    //shows the team page
    getTeams(automaticSwitch) {
        let curr = this.state;
        //now, we can get the game settings for the time
        curr['state'] = 2;
        this.getTime(curr, automaticSwitch);
    }

    //shows the live game page with the scoreboard
    getScore() {
        let curr = this.state;
        //now, we can get the game settings for the time
        curr['state'] = 3;
        this.getTime(curr, false);
    }

    //Allows settings.js to update the state of this component
    updateLive(live) {
        this.updateState('live', live);
    }

    /**
     * Gets the time and other settings needed before switching the page view
     * @param {JSON Object} prevState
     * @param {Boolean} automaticSwitch - Whether to automatically switch the page view if the game has started
     */
    getTime(prevState, automaticSwitch) {
        adminGameRequest(
            'game/getSettings',
            'POST',
            this.state.gameID,
            { includeSeconds: true },
            (d) => {
                //success
                if (d.success) {
                    let settings = d.data;

                    let serverOffset = d.offset;

                    let start = timeToServer(
                        serverOffset,
                        settings.public.start,
                        true,
                    );

                    let end = timeToServer(
                        serverOffset,
                        settings.public.end,
                        true,
                    );

                    prevState['time'] = {
                        start: start,
                        end: end,
                    };

                    prevState['live'] = settings.private.live;

                    if (automaticSwitch) {
                        let startDateTime = new Date(
                            start.replace(' ', 'T'),
                        ).getTime();
                        var now = new Date().getTime();
                        //Since the game has already started, we must automatically show the live game page
                        if (startDateTime <= now) {
                            prevState['state'] = 3;
                        }
                    }

                    prevState['gameName'] = settings.public.name;

                    prevState['gameType'] = parseInt(settings.public.type);

                    //recieved all the data now
                    prevState['recievedData'] = true;

                    this.setState(prevState);
                } else {
                    swal(d.message, '', 'error');
                    this.redirect('/');
                }
            },
        );
    }

    redirect(url = '/') {
        this.state['redirect']['redirect'] = true;
        this.state['redirect']['url'] = url;
        this.setState(this.state);
    }

    logOut() {
        firebase
            .auth()
            .signOut()
            .then(() => {
                // Sign-out successful.
                sessionStorage.clear();
                //now will be automatically re-routed in app.js
            })
            .catch((error) => {
                swal('Error logging out!', '', 'error');

                //now will be automatically re-routed in app.js
            });
    }

    changeState(newState) {
        this.updateState('state', newState);
    }

    render() {
        var body = null;
        var arrows = null;

        //Admin functionalities are limited if status is too high (the lower, the more permissions)
        let isLimited = this.state.adminStatus >= 2;

        if (this.state.state === 0) {
            //Settings Page
            body = (
                <Settings
                    playModal={this.state.startRightAway}
                    isLimited={isLimited}
                    isFullScreen={this.state.isFullScreen}
                    changeFullScreen={() =>
                        this.updateState(
                            'isFullScreen',
                            !this.state.isFullScreen,
                        )
                    }
                    updateLive={this.updateLive}
                    playGame={() => this.getTeams(true)}
                    goToPage={(url) => this.redirect(url)}
                    redirect={this.redirect}
                    gameID={this.state.gameID}
                />
            );
        } else if (this.state.state === 1) {
            //Questions Page
            body = (
                <QuestionAnswer
                    isLimited={isLimited}
                    isFullScreen={this.state.isFullScreen}
                    changeFullScreen={() =>
                        this.updateState(
                            'isFullScreen',
                            !this.state.isFullScreen,
                        )
                    }
                    redirect={this.redirect}
                    gameID={this.state.gameID}
                    name={localStorage.getItem('displayName')}
                ></QuestionAnswer>
            );
        } else if (this.state.state === 3) {
            //Live Game Page
            body = (
                <div>
                    <div style={{ zIndex: 20 }}>
                        <br />
                        <br />
                        {this.state.live ? (
                            <Instructions
                                gameType={this.state.gameType}
                                updateStatus={this.updateStatus}
                                gameCode={this.state.gameID}
                                time={this.state.time}
                            ></Instructions>
                        ) : null}
                        <AdminScoreboard
                            isFullScreen={this.state.isFullScreen}
                            changeFullScreen={() =>
                                this.updateState(
                                    'isFullScreen',
                                    !this.state.isFullScreen,
                                )
                            }
                            time={this.state.time}
                            redirect={this.redirect}
                            gameCode={this.state.gameID}
                        ></AdminScoreboard>
                    </div>
                </div>
            );
        } else if (this.state.state === 2) {
            //Teams Page
            body = (
                <div>
                    <div style={{ zIndex: 20 }}>
                        <br />
                        <br />
                        {this.state.live ? (
                            <Instructions
                                gameType={this.state.gameType}
                                updateStatus={this.updateStatus}
                                gameCode={this.state.gameID}
                                time={this.state.time}
                            ></Instructions>
                        ) : null}
                        <Teams
                            isFullScreen={this.state.isFullScreen}
                            changeFullScreen={() =>
                                this.updateState(
                                    'isFullScreen',
                                    !this.state.isFullScreen,
                                )
                            }
                            redirect={this.redirect}
                            gameID={this.state.gameID}
                            data={this.state.teams}
                            name={localStorage.getItem('displayName')}
                        />
                    </div>
                </div>
            );
        }

        if (this.state.redirect.redirect) {
            return <Redirect push to={this.state.redirect.url} />;
        }

        return (
            <DashboardLayoutAdmin
                adminStatus={this.state.adminStatus}
                isFullScreen={this.state.isFullScreen}
                home={false}
                isLive={this.state.live}
                questions={() => this.changeState(1)}
                settings={() => this.changeState(0)}
                teams={() => this.getTeams(false)}
                livegame={() => this.getScore()}
                logout={this.logOut}
            >
                <div className="AppGamePage">
                    <div>
                        <Navbar
                            fixed="top"
                            variant="dark"
                            className={'nav-bar'}
                        >
                            <h5 className="nav-header-game">Kontest</h5>

                            <Divider
                                orientation="vertical"
                                style={{ background: '#05192a' }}
                                flexItem
                            ></Divider>

                            <h5 className="nav-header-game titleStyle7">
                                {' '}
                                {this.state.gameName}
                            </h5>

                            <h5
                                className="nav-header-game"
                                style={{ color: '#06d6a0' }}
                            >
                                Code: {this.state.gameID}
                            </h5>
                            <Nav className="mr-auto"></Nav>

                            {this.state.isNew &&
                            (this.state.state == 1 || this.state.state == 2) ? (
                                <>
                                    <Link to="/admin/dashboard">
                                        <button
                                            className={'red-btn'}
                                            style={{ width: '110px' }}
                                        >
                                            All Games
                                        </button>
                                    </Link>

                                    <button
                                        onClick={this.continueIntro}
                                        className={'dark-green-btn'}
                                        style={{
                                            marginLeft: '15px',
                                            width: '110px',
                                        }}
                                    >
                                        Continue
                                    </button>
                                </>
                            ) : (
                                <Link to="/admin/dashboard">
                                    <button
                                        className={'red-btn'}
                                        style={{ width: '110px' }}
                                    >
                                        All Games
                                    </button>
                                </Link>
                            )}
                        </Navbar>
                    </div>
                    {arrows}

                    <br></br>

                    <div style={{ textAlign: 'center' }}>
                        {this.state.recievedData ? (
                            <>{body}</>
                        ) : (
                            <div className="pageDiv">
                                <br />
                                <br />
                                <ReactLoading
                                    className="loading2"
                                    type={'spin'}
                                    color={'#184c5d'}
                                    height="200px"
                                    width="200px"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayoutAdmin>
        );
    }
}

export default Admin;
