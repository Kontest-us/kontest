import React from 'react';
import '../../style/index.css';
import '../../style/buttons.css';
import '../../style/images.css';

import centerKontest from '../../style/assets/centerKontest.gif';
import leftKontest from '../../style/assets/leftKontest.png';
import rightKontest from '../../style/assets/rightKontest.png';
import leftKontestGif from '../../style/assets/leftKontest.gif';
import rightKontestGif from '../../style/assets/rightKontest.gif';
import publicKontest from '../../style/assets/kontestPublic.gif';

import reviewImage from '../../style/assets/review.gif';
import estimationImage from '../../style/assets/estimate.jpg';
import SampleScoreboard from './components/samplescoreboard';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, withRouter } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth';
import Divider from '@material-ui/core/Divider';
import MathComponent from '../Math';
import { MdPeople, MdFeedback } from 'react-icons/md';
import { IoAddCircleSharp, IoGameControllerOutline } from 'react-icons/io5';
import { AiFillQuestionCircle, AiFillEdit } from 'react-icons/ai';
import { BiCool, BiWorld } from 'react-icons/bi';
import RulesModal from './modals/rulesmodal';
import swal from 'sweetalert';
import Confetti from 'react-confetti';
import MathField from '../MathField';

var MIN_SCREEN = 700;

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.updateModal = this.updateModal.bind(this);
        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.answerEstimathon = this.answerEstimathon.bind(this);
        this.setMultAnswer = this.setMultAnswer.bind(this);
        this.answerMultiple = this.answerMultiple.bind(this);

        this.state = {
            showRules: false,
            type: 0,
            teamInstructionsModal: false,
            confetti: false,
            lowBound: '',
            highBound: '',
            setMult: -1,
            isCrossed: [],
            answerType: 1,
        };
    }

    changeAnswerType(type) {
        this.updateState('answerType', type);
    }

    setMultAnswer(ans) {
        if (this.state.isCrossed.indexOf(ans) === -1) {
            this.state['setMult'] = ans;
            this.setState(this.state);
        }
    }

    answerMultiple() {
        if (this.state.setMult === 2) {
            swal('Amazing job! You earned 100 points😊.', '', 'success').then(
                () => {
                    this.state['confetti'] = true;
                    this.state['lowBound'] = '';
                    this.state['highBound'] = '';
                    this.state['isCrossed'] = [];
                    this.setState(this.state);
                },
            );
        } else if (this.state.setMult != -1) {
            this.state.isCrossed.push(this.state.setMult);

            if (this.state.isCrossed.length === 3) {
                swal(
                    'Oh no, you have used up all of your guesses😖!',
                    '',
                    'error',
                );
                this.state['confetti'] = false;
                this.state['lowBound'] = '';
                this.state['highBound'] = '';
                this.state['isCrossed'] = [];
                this.setState(this.state);
            } else {
                swal(
                    "Nope, you are wrong. I'll be nice and give you one more try😌.",
                    '',
                    'error',
                );
                this.state['setMult'] = -1;
                this.setState(this.state);
            }
        }

        this.state['setMult'] = -1;
        this.setState(this.state);
    }

    answerEstimathon() {
        let lowBound = this.state.lowBound;
        let highBound = this.state.highBound;

        if (
            !isNaN(lowBound) &&
            !isNaN(highBound) &&
            lowBound != '' &&
            highBound != ''
        ) {
            if (parseInt(highBound) / parseInt(lowBound) > 100) {
                swal(
                    'Your bounds are too far apart. Please try making the lower bound and higher bound closer.',
                    '',
                    'error',
                );
            } else if (
                parseInt(lowBound) <= 3472 &&
                parseInt(highBound) >= 3472
            ) {
                let score = Math.floor(highBound / lowBound);
                swal(
                    'Great job! Your score is ' +
                        score +
                        ' (the best score is 1).',
                    '',
                    'success',
                ).then(() => {
                    this.state['confetti'] = true;
                    this.state['lowBound'] = '';
                    this.state['highBound'] = '';
                    this.setState(this.state);
                });
            } else {
                swal(
                    "Nope, the answer isn't between " +
                        parseInt(lowBound) +
                        ' and ' +
                        parseInt(highBound) +
                        ". I'll be nice and give you one more try.",
                    '',
                    'error',
                );
            }
        } else {
            swal('Please enter numbers as your bounds!', '', 'error');
        }
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    updateModal(showModal, whichModal, type) {
        if (whichModal === 'rules') {
            this.state['showRules'] = showModal;
            this.state['type'] = type;
            this.setState(this.state);
        } else if (whichModal === 'team') {
            this.state['teamInstructionsModal'] = showModal;
            this.setState(this.state);
        }
    }

    render() {
        let submitButton = {
            fontWeight: 'bold',
            margin: '7px',
        };

        let blockStyle = {
            backgroundColor: 'white',
            margin: '30px',
            borderColor: '#dfe3e6',
            boxShadow: '6px 6px 8px 1px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            marginTop: '30px',
            width: '75vw',
            textAlign: 'center',
        };

        let blockStyle1 = {
            backgroundColor: 'transparent',
            margin: '30px',
            borderColor: 'transparent',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            marginTop: '30px',
            width: '75vw',
            textAlign: 'center',
        };

        if (window.innerWidth <= MIN_SCREEN) {
            blockStyle['width'] = '90vw';
            blockStyle1['width'] = '90vw';
        }

        let nameStyle = {
            fontWeight: 'bold',
            fontSize: '20px',
            color: '#073b4c',
            textDecoration: 'underline',
        };

        //check to see if a user is logged in
        var user = firebase.auth().currentUser;

        let confettiPieces = window.innerWidth > MIN_SCREEN ? 500 : 200;

        /**
         * For the home page, there will be two sets of html code. One will be for mobile devices and the other will be for ipad and larger screen devices.
         */

        return (
            <div className={'App'}>
                {this.state.confetti ? (
                    <Confetti
                        drawShape={(ctx) => {
                            ctx.beginPath();
                            for (let i = 0; i < 22; i++) {
                                const angle = 0.35 * i;
                                const x = (0.2 + 1.5 * angle) * Math.cos(angle);
                                const y = (0.2 + 1.5 * angle) * Math.sin(angle);
                                ctx.lineTo(x, y);
                            }
                            ctx.stroke();
                            ctx.closePath();
                        }}
                        onConfettiComplete={(confetti) => {
                            this.state['confetti'] = false;
                            this.setState(this.state);
                        }}
                        colors={[
                            '#2cbff063',
                            '#06D6A0',
                            '#ffda85',
                            '#EF476F',
                            '#118ab2',
                        ]}
                        style={{
                            zIndex: 200,
                            width: '100%',
                            height: '100%',
                            position: 'fixed',
                        }}
                        recycle={false}
                        numberOfPieces={confettiPieces}
                    ></Confetti>
                ) : null}

                <div>
                    <Navbar fixed="top" variant="dark" className="nav-bar">
                        <h5 className="nav-header-game">Kontest</h5>
                        <Nav className="mr-auto text-center"></Nav>
                        <Link to="/play">
                            <button
                                className=" dark-green-btn"
                                style={submitButton}
                            >
                                Join Game
                            </button>
                        </Link>
                        &nbsp;&nbsp;
                        {user ? (
                            <Link to="/admin/dashboard">
                                <button
                                    className="blue-btn"
                                    style={submitButton}
                                >
                                    Teacher Dashboard
                                </button>
                            </Link>
                        ) : (
                            <Link to="/admin/login">
                                <button
                                    className="blue-btn"
                                    style={submitButton}
                                >
                                    Teacher Login
                                </button>
                            </Link>
                        )}
                    </Navbar>
                </div>

                <br></br>
                <br></br>
                <br></br>
                <br></br>

                <div>
                    {/* WHAT IS Kontest SECTION */}

                    {window.innerWidth > MIN_SCREEN ? (
                        <div style={blockStyle1}>
                            {/* WHAT IS Kontest SECTION REGULAR */}

                            <div className="row2">
                                <div
                                    className="rows2"
                                    style={{
                                        textAlign: 'left',
                                        margin: 'auto',
                                        marginLeft: '20px',
                                    }}
                                >
                                    <h1
                                        className="titleStyle2"
                                        style={{
                                            fontWeight: 'bolder',
                                            fontSize: '35px',
                                            color: '#073b4c',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        What is Kontest?
                                    </h1>
                                    <Divider></Divider>

                                    <p className="market-text">
                                        It’s simple: a live learning game that{' '}
                                        <b>MAXIMIZES </b>
                                        student collaboration while{' '}
                                        <b>MINIMIZING </b> teacher work!
                                    </p>

                                    <Divider></Divider>

                                    <div style={{ textAlign: 'left' }}>
                                        <Link to="admin/signup">
                                            <button
                                                className="blue-btn"
                                                style={{
                                                    width: '250px',
                                                    marginTop: '20px',
                                                }}
                                            >
                                                Teacher Sign Up!
                                            </button>
                                        </Link>
                                    </div>

                                    <div style={{ textAlign: 'left' }}>
                                        <Link to="play/sample">
                                            <button
                                                className="red-btn"
                                                style={{
                                                    width: '250px',
                                                    marginTop: '20px',
                                                }}
                                            >
                                                Play Sample Game!
                                            </button>
                                        </Link>
                                    </div>
                                </div>

                                <div
                                    className="rows2"
                                    style={{ alignContent: 'center' }}
                                >
                                    <SampleScoreboard></SampleScoreboard>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={blockStyle1}>
                            {/* WHAT IS Kontest SECTION MOBILE */}

                            <div className="">
                                <div
                                    className="rows2"
                                    style={{ alignContent: 'center' }}
                                ></div>

                                <h1
                                    className="titleStyle2"
                                    style={{
                                        fontWeight: 'bolder',
                                        fontSize: '35px',
                                        color: '#073b4c',
                                        marginBottom: '20px',
                                    }}
                                >
                                    What is Kontest?
                                </h1>
                                <Divider></Divider>

                                <p className="market-text">
                                    It’s simple: a live learning game that{' '}
                                    <b>MAXIMIZES </b>
                                    student collaboration while{' '}
                                    <b>MINIMIZING </b> teacher work!
                                </p>

                                <Divider></Divider>

                                <div>
                                    <Link to="admin/signup">
                                        <button
                                            className="blue-btn"
                                            style={{
                                                width: '250px',
                                                marginTop: '20px',
                                            }}
                                        >
                                            Teacher Sign Up!
                                        </button>
                                    </Link>
                                </div>

                                <div>
                                    <Link to="play/sample">
                                        <button
                                            className="red-btn"
                                            style={{
                                                width: '250px',
                                                marginTop: '20px',
                                            }}
                                        >
                                            Play Sample Game!
                                        </button>
                                    </Link>
                                </div>

                                {/* </div> */}
                            </div>
                        </div>
                    )}

                    {/* WHAT DO WE PROVIDE SECTION */}

                    {window.innerWidth > MIN_SCREEN ? (
                        <div style={blockStyle}>
                            <h1
                                className="titleStyle2"
                                style={{
                                    fontWeight: 'bolder',
                                    fontSize: '35px',
                                    color: '#073b4c',
                                    marginBottom: '20px',
                                }}
                            >
                                What can you do?
                            </h1>

                            <div className="imageRow">
                                <div className="imageColumn">
                                    <img
                                        src={leftKontest}
                                        className="homeImg1"
                                        alt="teacher page"
                                    />
                                </div>
                                <div className="imageColumn">
                                    <img
                                        src={centerKontest}
                                        className="homeImg2"
                                        alt="teacher page"
                                    />
                                </div>
                                <div className="imageColumn">
                                    <img
                                        src={rightKontest}
                                        className="homeImg3"
                                        alt="teacher page"
                                    />
                                </div>
                            </div>

                            <div className="row2">
                                <div
                                    className="rows2"
                                    style={{ textAlign: 'center' }}
                                >
                                    <h1 className="titleStyle3">
                                        <b>Teachers</b>
                                    </h1>
                                    <br></br>

                                    <div className="holder">
                                        <div className="smallLine smallLine1"></div>
                                        <div className="smallLine smallLine2"></div>
                                    </div>

                                    <div className="featureDiv">
                                        <BiWorld
                                            color="#06c693"
                                            size="45px"
                                            style={{
                                                margin: '2px',
                                                display: 'inline-block',
                                            }}
                                        />
                                        <p className="titleStyle4">
                                            Create Games
                                        </p>
                                        <p className="titleStyle5">
                                            Organize games for your classrooms!
                                            Each game includes custom settings
                                            and supports all time zones.
                                        </p>
                                    </div>

                                    <Divider></Divider>

                                    <div className="featureDiv">
                                        <AiFillEdit
                                            color="#06c693"
                                            size="45px"
                                            style={{
                                                margin: '2px',
                                                display: 'inline-block',
                                            }}
                                        />
                                        <p className="titleStyle4">
                                            Manage Teams
                                        </p>
                                        <p className="titleStyle5">
                                            Create and update teams with student
                                            names. As a bonus, you can also
                                            randomize teams!
                                        </p>
                                    </div>

                                    <Divider></Divider>

                                    <div className="featureDiv">
                                        <IoAddCircleSharp
                                            color="#FFD166"
                                            size="45px"
                                            style={{
                                                margin: '2px',
                                                display: 'inline-block',
                                            }}
                                        />
                                        <p className="titleStyle4">
                                            Add Questions
                                        </p>
                                        <p className="titleStyle5">
                                            Add <b>estimation</b>,{' '}
                                            <b>multiple choice</b>, and{' '}
                                            <b>single answer</b> questions.
                                            Questions can include math
                                            expressions and images.
                                        </p>
                                    </div>

                                    <Divider></Divider>

                                    <div className="featureDiv">
                                        <BiCool
                                            color="#EF476F"
                                            size="45px"
                                            style={{
                                                margin: '2px',
                                                display: 'inline-block',
                                            }}
                                        />
                                        <p className="titleStyle4">
                                            Leave the Grading to Us!
                                        </p>
                                        <p className="titleStyle5">
                                            We grade student responses in
                                            real-time, so all you have to do is
                                            sit back, relax, and watch student
                                            progress on our <b>Live Game</b>{' '}
                                            page.
                                        </p>
                                    </div>
                                </div>

                                <Divider
                                    orientation="vertical"
                                    flexItem
                                ></Divider>

                                <div
                                    className="rows2"
                                    style={{ textAlign: 'center' }}
                                >
                                    <h1 className="titleStyle3">
                                        <b>Students</b>
                                    </h1>
                                    <br></br>

                                    <div className="holder">
                                        <div className="smallLine smallLine1"></div>
                                        <div className="smallLine smallLine2"></div>
                                    </div>

                                    <div className="featureDiv">
                                        <IoGameControllerOutline
                                            color="#06c693"
                                            size="45px"
                                            style={{
                                                margin: '2px',
                                                display: 'inline-block',
                                            }}
                                        />
                                        <p className="titleStyle4">
                                            Join Games
                                        </p>
                                        <p className="titleStyle5">
                                            Join games with a game code. You can
                                            also rejoin games with the click of
                                            a button!
                                        </p>
                                    </div>

                                    <Divider></Divider>

                                    <div className="featureDiv">
                                        <MdPeople
                                            color="#06c693"
                                            size="45px"
                                            style={{
                                                margin: '2px',
                                                display: 'inline-block',
                                            }}
                                        />
                                        <p className="titleStyle4">
                                            Create Teams
                                        </p>
                                        <p className="titleStyle5">
                                            Create or join teams with your
                                            friends. You can also see the other
                                            teams being created in real-time.
                                        </p>
                                    </div>

                                    <Divider></Divider>

                                    <div className="featureDiv">
                                        <AiFillQuestionCircle
                                            color="#FFD166"
                                            size="45px"
                                            style={{
                                                margin: '2px',
                                                display: 'inline-block',
                                            }}
                                        />
                                        <p className="titleStyle4">
                                            Collaborate on Questions
                                        </p>
                                        <p className="titleStyle5">
                                            Work together to answer all of the
                                            game's questions. You only need to
                                            submit a correct answer once.
                                        </p>
                                    </div>

                                    <Divider></Divider>

                                    <div className="featureDiv">
                                        <MdFeedback
                                            color="#EF476F"
                                            size="45px"
                                            style={{
                                                margin: '2px',
                                                display: 'inline-block',
                                            }}
                                        />
                                        <p className="titleStyle4">
                                            Receive Immediate Feedback
                                        </p>
                                        <p className="titleStyle5">
                                            Get alerted if you are right or
                                            wrong. You can also view a live
                                            scoreboard to see how other teams
                                            are doing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={blockStyle}>
                            <h1 className="titleStyle2">What can you do?</h1>

                            <div className="imageRow">
                                <div className="imageColumn">
                                    <img
                                        src={leftKontestGif}
                                        className="homeImg2"
                                        alt="teacher page"
                                    />
                                </div>
                            </div>

                            <br></br>

                            <div className="" style={{ textAlign: 'center' }}>
                                <h1 className="titleStyle3">
                                    <b>Students</b>
                                </h1>

                                <div className="featureDiv">
                                    <IoGameControllerOutline
                                        color="#06c693"
                                        size="45px"
                                        style={{
                                            margin: '2px',
                                            display: 'inline-block',
                                        }}
                                    />
                                    <p className="titleStyle4">Join Games</p>
                                    <p className="titleStyle5">
                                        Join games with a game code. You can
                                        also rejoin games with the click of a
                                        button!
                                    </p>
                                </div>

                                <Divider></Divider>

                                <div className="featureDiv">
                                    <MdPeople
                                        color="#06c693"
                                        size="45px"
                                        style={{
                                            margin: '2px',
                                            display: 'inline-block',
                                        }}
                                    />
                                    <p className="titleStyle4">Create Teams</p>
                                    <p className="titleStyle5">
                                        Create or join teams with your friends.
                                        You can also see the other teams being
                                        created in <b>real-time.</b>
                                    </p>
                                </div>

                                <Divider></Divider>

                                <div className="featureDiv">
                                    <AiFillQuestionCircle
                                        color="#FFD166"
                                        size="45px"
                                        style={{
                                            margin: '2px',
                                            display: 'inline-block',
                                        }}
                                    />
                                    <p className="titleStyle4">
                                        Collaborate on Questions
                                    </p>
                                    <p className="titleStyle5">
                                        Work together to answer all of the
                                        game's questions. You only need to
                                        submit a correct answer once.
                                    </p>
                                </div>

                                <Divider></Divider>

                                <div className="featureDiv">
                                    <MdFeedback
                                        color="#EF476F"
                                        size="45px"
                                        style={{
                                            margin: '2px',
                                            display: 'inline-block',
                                        }}
                                    />
                                    <p className="titleStyle4">
                                        Receive Immediate Feedback
                                    </p>
                                    <p className="titleStyle5">
                                        Get alerted if you are right or wrong.
                                        You can also view a{' '}
                                        <b>live scoreboard</b> to see how other
                                        teams are doing.
                                    </p>
                                </div>
                            </div>

                            <div className="holder">
                                <div className="smallLine smallLine1"></div>
                                <div className="smallLine smallLine2"></div>
                            </div>

                            <div className="imageRow">
                                <div className="imageColumn">
                                    <img
                                        src={rightKontestGif}
                                        className="homeImg2"
                                        alt="teacher page"
                                    />
                                </div>
                            </div>

                            <br></br>

                            <div className="" style={{ textAlign: 'center' }}>
                                <h1 className="titleStyle3">
                                    <b>Teachers</b>
                                </h1>

                                <div className="featureDiv">
                                    <BiWorld
                                        color="#06c693"
                                        size="45px"
                                        style={{
                                            margin: '2px',
                                            display: 'inline-block',
                                        }}
                                    />
                                    <p className="titleStyle4">Create Games</p>
                                    <p className="titleStyle5">
                                        Organize games for your classrooms! Each
                                        game includes custom settings and
                                        supports all time zones.
                                    </p>
                                </div>

                                <Divider></Divider>

                                <div className="featureDiv">
                                    <AiFillEdit
                                        color="#06c693"
                                        size="45px"
                                        style={{
                                            margin: '2px',
                                            display: 'inline-block',
                                        }}
                                    />
                                    <p className="titleStyle4">Manage Teams</p>
                                    <p className="titleStyle5">
                                        Create and update teams with student
                                        names. As a bonus, you can also
                                        randomize teams!
                                    </p>
                                </div>

                                <Divider></Divider>

                                <div className="featureDiv">
                                    <IoAddCircleSharp
                                        color="#FFD166"
                                        size="45px"
                                        style={{
                                            margin: '2px',
                                            display: 'inline-block',
                                        }}
                                    />
                                    <p className="titleStyle4">Add Questions</p>
                                    <p className="titleStyle5">
                                        Add <b>estimation</b>,{' '}
                                        <b>multiple choice</b>, and{' '}
                                        <b>single answer</b> questions.
                                        Questions can include math expressions
                                        and images.
                                    </p>
                                </div>

                                <Divider></Divider>

                                <div className="featureDiv">
                                    <BiCool
                                        color="#EF476F"
                                        size="45px"
                                        style={{
                                            margin: '2px',
                                            display: 'inline-block',
                                        }}
                                    />
                                    <p className="titleStyle4">
                                        Leave the Grading to Us!
                                    </p>
                                    <p className="titleStyle5">
                                        We grade student responses in real-time,
                                        so all you have to do is sit back,
                                        relax, and watch student progress on our{' '}
                                        <b>Live Game</b> page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* WHAT DO WE SUPPORT SECTION */}

                    {window.innerWidth > MIN_SCREEN ? (
                        <div style={blockStyle}>
                            <h1 className="titleStyle2">You can play...</h1>

                            <div className="row2">
                                <div className="rows2">
                                    <p className="titleStyle3">
                                        <b>Review Games:</b>
                                    </p>

                                    <p
                                        className="market-text"
                                        style={{ textAlign: 'left' }}
                                    >
                                        Review before a quiz or test with
                                        collaborative <b>multiple choice</b> and{' '}
                                        <b>single answer questions</b>. Students
                                        earn points by answering correctly, and
                                        the team with the <b>most points</b> at
                                        the end wins!
                                    </p>

                                    <div
                                        className="market-text"
                                        style={{ textAlign: 'center' }}
                                    >
                                        <b>Question: </b>
                                        <MathComponent
                                            text={
                                                'What does this equal: {int_(0)^(5) 2x*dx}?'
                                            }
                                        />
                                    </div>

                                    <p
                                        className="market-text"
                                        style={{ textAlign: 'center' }}
                                    >
                                        <b>Choices: </b>
                                    </p>

                                    <div
                                        style={{
                                            width: '100%',
                                            margin: 'auto',
                                            alignContent: 'center',
                                            justifyContent: 'space-evenly',
                                            height: 'fit-content',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <div
                                            key={0}
                                            onClick={() =>
                                                this.setMultAnswer(0)
                                            }
                                            className={
                                                'answerChoice3 ' +
                                                (this.state.isCrossed.indexOf(
                                                    0,
                                                ) >= 0
                                                    ? 'crossed'
                                                    : '')
                                            }
                                            style={{
                                                backgroundColor:
                                                    this.state.setMult === 0
                                                        ? '#ffda85'
                                                        : 'transparent',
                                                width: '35%',
                                                marginTop: '5px',
                                            }}
                                        >
                                            <div
                                                style={{ textAlign: 'center' }}
                                            >
                                                <MathComponent
                                                    text={
                                                        String.fromCharCode(
                                                            0 + 65,
                                                        ) +
                                                        ' ) ' +
                                                        '{-sqrt(7)}'
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div
                                            key={1}
                                            onClick={() =>
                                                this.setMultAnswer(1)
                                            }
                                            className={
                                                'answerChoice3 ' +
                                                (this.state.isCrossed.indexOf(
                                                    1,
                                                ) >= 0
                                                    ? 'crossed'
                                                    : '')
                                            }
                                            style={{
                                                backgroundColor:
                                                    this.state.setMult === 1
                                                        ? '#ffda85'
                                                        : 'transparent',
                                                width: '35%',
                                                marginTop: '5px',
                                            }}
                                        >
                                            <div
                                                style={{ textAlign: 'center' }}
                                            >
                                                <MathComponent
                                                    text={
                                                        String.fromCharCode(
                                                            1 + 65,
                                                        ) +
                                                        ' ) ' +
                                                        '{12}'
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div
                                            key={2}
                                            onClick={() =>
                                                this.setMultAnswer(2)
                                            }
                                            className={
                                                'answerChoice3 ' +
                                                (this.state.isCrossed.indexOf(
                                                    2,
                                                ) >= 0
                                                    ? 'crossed'
                                                    : '')
                                            }
                                            style={{
                                                backgroundColor:
                                                    this.state.setMult === 2
                                                        ? '#ffda85'
                                                        : 'transparent',
                                                width: '35%',
                                                marginTop: '5px',
                                            }}
                                        >
                                            <div
                                                style={{ textAlign: 'center' }}
                                            >
                                                <MathComponent
                                                    text={
                                                        String.fromCharCode(
                                                            2 + 65,
                                                        ) +
                                                        ' ) ' +
                                                        '{25}'
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div
                                            key={3}
                                            onClick={() =>
                                                this.setMultAnswer(3)
                                            }
                                            className={
                                                'answerChoice3 ' +
                                                (this.state.isCrossed.indexOf(
                                                    3,
                                                ) >= 0
                                                    ? 'crossed'
                                                    : '')
                                            }
                                            style={{
                                                backgroundColor:
                                                    this.state.setMult === 3
                                                        ? '#ffda85'
                                                        : 'transparent',
                                                width: '35%',
                                                marginTop: '5px',
                                            }}
                                        >
                                            <div
                                                style={{ textAlign: 'center' }}
                                            >
                                                <MathComponent
                                                    text={
                                                        String.fromCharCode(
                                                            3 + 65,
                                                        ) +
                                                        ' ) ' +
                                                        '{3*pi}'
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <button
                                            className="form-control dark-green-btn"
                                            style={{
                                                align: 'center',
                                                margin: '0 auto',
                                                marginTop: '10px',
                                                width: '400px',
                                            }}
                                            onClick={this.answerMultiple}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className="rows2"
                                    style={{ margin: 'auto' }}
                                >
                                    <img
                                        src={reviewImage}
                                        alt="review image"
                                        style={{ width: '30%', padding: '0px' }}
                                        className={'center'}
                                    />
                                    <br />
                                    <br />
                                    <button
                                        className="blue-btn"
                                        style={{ width: '50%' }}
                                        onClick={() =>
                                            this.updateModal(true, 'rules', 2)
                                        }
                                    >
                                        Review Game Rules
                                    </button>
                                </div>
                            </div>

                            <Divider></Divider>

                            <div className="row2">
                                <div
                                    className="rows2"
                                    style={{ margin: 'auto' }}
                                >
                                    <img
                                        src={estimationImage}
                                        alt="estimate image"
                                        style={{ width: '50%', padding: '0px' }}
                                        className={'center'}
                                    />

                                    <br />
                                    <br />
                                    <button
                                        className="blue-btn"
                                        style={{ width: '50%' }}
                                        onClick={() =>
                                            this.updateModal(true, 'rules', 1)
                                        }
                                    >
                                        Estimation Game Rules
                                    </button>
                                </div>

                                <div className="rows2">
                                    <p className="titleStyle3">
                                        <b>Estimation Games:</b>
                                    </p>

                                    <p
                                        className="market-text"
                                        style={{ textAlign: 'left' }}
                                    >
                                        Collaborate with your friends on finding{' '}
                                        <b>estimations</b> for mind-boggling
                                        questions. The closer your estimation,
                                        the more points you lose. The team with
                                        the <b>least points</b> at the end wins!
                                    </p>

                                    <p
                                        className="market-text"
                                        style={{ textAlign: 'center' }}
                                    >
                                        <b> Question: </b>
                                        What is the mass of a Lamborghini
                                        Aventador in pounds?
                                    </p>

                                    <p
                                        className="market-text"
                                        style={{ textAlign: 'center' }}
                                    >
                                        <b>Enter your Guesses:</b>
                                    </p>

                                    <div className="form-group">
                                        <input
                                            style={{
                                                backgroundColor: '#DAF3FC',
                                                margin: '0 auto',
                                                width: '400px',
                                            }}
                                            type="tel"
                                            className="form-control"
                                            name="lowBound"
                                            value={this.state.lowBound}
                                            placeholder="Enter lower guess"
                                            onChange={this.valueChanged}
                                        />
                                        <br></br>
                                        <input
                                            style={{
                                                backgroundColor: '#DAF3FC',
                                                marginTop: '15px',
                                                margin: '0 auto',
                                                width: '400px',
                                            }}
                                            type="tel"
                                            className="form-control"
                                            name="highBound"
                                            value={this.state.highBound}
                                            placeholder="Enter upper guess"
                                            onChange={this.valueChanged}
                                        />
                                        <br></br>
                                        <button
                                            className="form-control dark-green-btn"
                                            style={{
                                                align: 'center',
                                                margin: '0 auto',
                                                width: '400px',
                                            }}
                                            onClick={this.answerEstimathon}
                                        >
                                            Submit
                                        </button>
                                        <br></br>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={blockStyle}>
                            <h1 className="titleStyle2">You can play...</h1>

                            <div className="">
                                <p className="titleStyle3">
                                    <b>Review Games:</b>
                                </p>

                                <p
                                    className="market-text"
                                    style={{ textAlign: 'center' }}
                                >
                                    Review before a quiz or test with
                                    collaborative <b>multiple choice</b> and{' '}
                                    <b>single answer questions</b>. Students
                                    earn points by answering correctly, and the
                                    team with the <b>most points</b> at the end
                                    wins!
                                </p>

                                <div
                                    className="market-text"
                                    style={{ textAlign: 'center' }}
                                >
                                    <b>Question: </b>
                                    <MathComponent
                                        text={
                                            'What does this equal: {int_(0)^(5) 2x*dx}?'
                                        }
                                    />
                                </div>

                                <p
                                    className="market-text"
                                    style={{ textAlign: 'center' }}
                                >
                                    <b>Choices: </b>
                                </p>

                                <div
                                    style={{
                                        width: '100%',
                                        margin: 'auto',
                                        alignContent: 'center',
                                        justifyContent: 'space-evenly',
                                        height: 'fit-content',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div
                                        key={0}
                                        onClick={() => this.setMultAnswer(0)}
                                        className={
                                            'answerChoice3 ' +
                                            (this.state.isCrossed.indexOf(0) >=
                                            0
                                                ? 'crossed'
                                                : '')
                                        }
                                        style={{
                                            backgroundColor:
                                                this.state.setMult === 0
                                                    ? '#ffda85'
                                                    : 'transparent',
                                            width: '35%',
                                            marginTop: '5px',
                                        }}
                                    >
                                        <div style={{ textAlign: 'center' }}>
                                            <MathComponent
                                                text={
                                                    String.fromCharCode(
                                                        0 + 65,
                                                    ) +
                                                    ' ) ' +
                                                    '{-sqrt(7)}'
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div
                                        key={1}
                                        onClick={() => this.setMultAnswer(1)}
                                        className={
                                            'answerChoice3 ' +
                                            (this.state.isCrossed.indexOf(1) >=
                                            0
                                                ? 'crossed'
                                                : '')
                                        }
                                        style={{
                                            backgroundColor:
                                                this.state.setMult === 1
                                                    ? '#ffda85'
                                                    : 'transparent',
                                            width: '35%',
                                            marginTop: '5px',
                                        }}
                                    >
                                        <div style={{ textAlign: 'center' }}>
                                            <MathComponent
                                                text={
                                                    String.fromCharCode(
                                                        1 + 65,
                                                    ) +
                                                    ' ) ' +
                                                    '{12}'
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div
                                        key={2}
                                        onClick={() => this.setMultAnswer(2)}
                                        className={
                                            'answerChoice3 ' +
                                            (this.state.isCrossed.indexOf(2) >=
                                            0
                                                ? 'crossed'
                                                : '')
                                        }
                                        style={{
                                            backgroundColor:
                                                this.state.setMult === 2
                                                    ? '#ffda85'
                                                    : 'transparent',
                                            width: '35%',
                                            marginTop: '5px',
                                        }}
                                    >
                                        <div style={{ textAlign: 'center' }}>
                                            <MathComponent
                                                text={
                                                    String.fromCharCode(
                                                        2 + 65,
                                                    ) +
                                                    ' ) ' +
                                                    '{25}'
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div
                                        key={3}
                                        onClick={() => this.setMultAnswer(3)}
                                        className={
                                            'answerChoice3 ' +
                                            (this.state.isCrossed.indexOf(3) >=
                                            0
                                                ? 'crossed'
                                                : '')
                                        }
                                        style={{
                                            backgroundColor:
                                                this.state.setMult === 3
                                                    ? '#ffda85'
                                                    : 'transparent',
                                            width: '35%',
                                            marginTop: '5px',
                                        }}
                                    >
                                        <div style={{ textAlign: 'center' }}>
                                            <MathComponent
                                                text={
                                                    String.fromCharCode(
                                                        3 + 65,
                                                    ) +
                                                    ' ) ' +
                                                    '{3*pi}'
                                                }
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="form-control dark-green-btn"
                                        style={{
                                            align: 'center',
                                            margin: '0 auto',
                                            marginTop: '10px',
                                            width: '90%',
                                        }}
                                        onClick={this.answerMultiple}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>

                            <br></br>
                            <Divider></Divider>
                            <br></br>

                            <div className="">
                                <p className="titleStyle3">
                                    <b>Estimation Games:</b>
                                </p>

                                <p
                                    className="market-text"
                                    style={{ textAlign: 'center' }}
                                >
                                    Collaborate with your friends on finding{' '}
                                    <b>estimations</b> for mind-boggling
                                    questions. The closer your estimation, the
                                    more points you lose. The team with the{' '}
                                    <b>least points</b> at the end wins!
                                </p>

                                <p
                                    className="market-text"
                                    style={{ textAlign: 'center' }}
                                >
                                    <b> Question: </b>
                                    What is the mass of a Lamborghini Aventador
                                    in pounds?
                                </p>

                                <p
                                    className="market-text"
                                    style={{ textAlign: 'center' }}
                                >
                                    <b>Enter your Guesses:</b>
                                </p>

                                <div className="form-group">
                                    <input
                                        style={{
                                            backgroundColor: '#DAF3FC',
                                            margin: '0 auto',
                                            width: '90%',
                                        }}
                                        type="tel"
                                        className="form-control"
                                        name="lowBound"
                                        value={this.state.lowBound}
                                        placeholder="Enter lower guess"
                                        onChange={this.valueChanged}
                                    />
                                    <br></br>
                                    <input
                                        style={{
                                            backgroundColor: '#DAF3FC',
                                            marginTop: '15px',
                                            margin: '0 auto',
                                            width: '90%',
                                        }}
                                        type="tel"
                                        className="form-control"
                                        name="highBound"
                                        value={this.state.highBound}
                                        placeholder="Enter upper guess"
                                        onChange={this.valueChanged}
                                    />
                                    <br></br>
                                    <button
                                        className="form-control dark-green-btn"
                                        style={{
                                            align: 'center',
                                            margin: '0 auto',
                                            width: '90%',
                                        }}
                                        onClick={this.answerEstimathon}
                                    >
                                        Submit
                                    </button>
                                    <br></br>
                                </div>
                            </div>
                        </div>
                    )}

                    {window.innerWidth > MIN_SCREEN ? (
                        <div style={blockStyle}>
                            <h1 className="titleStyle2">Summer 2021 UPDATES</h1>

                            <div className="market-text">
                                <p className="bulletUnderline">
                                    <b>Better Math Support</b>{' '}
                                </p>

                                <div className="bulletPointDiv">
                                    <p>
                                        {' '}
                                        We've added an input box and virtual
                                        keyboard that supports text <b>
                                            AND
                                        </b>{' '}
                                        math expressions!{' '}
                                    </p>
                                    <MathField
                                        automateScroll={false}
                                        readOnly={false}
                                        value={''}
                                        onChange={(val) => {}}
                                    />
                                    <br />
                                    <p>
                                        You can also submit numerical,
                                        algebraic, and calculus answers during
                                        review games.
                                    </p>
                                    <MathComponent text="{(x+5)(x-2)^2(x+3) = 0}" />
                                    <MathComponent text="{dy/dx = (dy)/(du) * (du)/(dx)}" />
                                </div>

                                <p className="bulletUnderline">
                                    <b>Public Games</b>{' '}
                                </p>

                                <p>
                                    Play games created by other teachers and
                                    educators.
                                </p>

                                <img
                                    src={publicKontest}
                                    style={{
                                        margin: '0 auto',
                                        marginTop: '15px',
                                        width: '50%',
                                        borderRadius: '5%',
                                    }}
                                    alt="teacher page"
                                />

                                <p className="bulletUnderline">
                                    <b>Improved Estimation Games</b>{' '}
                                </p>

                                <div className="bulletPointDiv">
                                    <p>
                                        It's now easier to input your
                                        estimations. The{' '}
                                        <a
                                            style={{
                                                textDecoration: 'underline',
                                                color: '#118ab2',
                                            }}
                                            onClick={() =>
                                                this.updateModal(
                                                    true,
                                                    'rules',
                                                    1,
                                                )
                                            }
                                        >
                                            game rules
                                        </a>{' '}
                                        have also changed.
                                    </p>
                                </div>

                                <div
                                    className="rows"
                                    style={{ textAlign: 'center' }}
                                >
                                    <button
                                        className={
                                            'row ' +
                                            (parseInt(this.state.answerType) ==
                                            1
                                                ? 'estimathon-div-highlighted'
                                                : 'estimathon-div-regular')
                                        }
                                        onClick={() => this.changeAnswerType(1)}
                                    >
                                        <input
                                            readOnly={true}
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#073b4c',
                                                backgroundColor: '#DAF3FC',
                                                margin: 'auto',
                                                width: '200px',
                                            }}
                                            type="tel"
                                            className="form-control"
                                            name="answer"
                                            value={'50,000,000'}
                                            placeholder="Enter full answer"
                                        />
                                    </button>

                                    <button className="row estimathon-div-none">
                                        <p className="titleStyle8">OR</p>
                                    </button>

                                    <button
                                        className={
                                            'row ' +
                                            (parseInt(this.state.answerType) ==
                                            2
                                                ? 'estimathon-div-highlighted'
                                                : 'estimathon-div-regular')
                                        }
                                        onClick={() => this.changeAnswerType(2)}
                                    >
                                        <div className="form-inline">
                                            <input
                                                readOnly={true}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: '#073b4c',
                                                    backgroundColor: '#DAF3FC',
                                                    width: '100px',
                                                    marginRight: '5px',
                                                }}
                                                type="tel"
                                                className="form-control"
                                                name="answerBase"
                                                value={'5'}
                                                placeholder="some base"
                                            />
                                            <h3
                                                className="titleStyle8"
                                                style={{ marginTop: '5px' }}
                                            >
                                                * 10
                                                <sup>
                                                    <input
                                                        readOnly={true}
                                                        style={{
                                                            fontWeight: 'bold',
                                                            color: '#073b4c',
                                                            backgroundColor:
                                                                '#DAF3FC',
                                                            width: '100px',
                                                            marginLeft: '5px',
                                                            marginTop: '-15px',
                                                        }}
                                                        type="tel"
                                                        className="form-control"
                                                        name="answerExp"
                                                        value={'7'}
                                                        placeholder="some exponent"
                                                    />
                                                </sup>
                                            </h3>
                                        </div>
                                    </button>
                                </div>

                                <p className="bulletUnderline">
                                    <b>More Confetti!</b>{' '}
                                </p>

                                <div className="bulletPointDiv">
                                    <button
                                        className="yellow-btn"
                                        onClick={() => {
                                            this.state['confetti'] = true;
                                            this.setState(this.state);
                                        }}
                                        style={{
                                            width: '300px',
                                            height: 'fit-content',
                                            fontSize: '30px',
                                        }}
                                    >
                                        Celebration Time!
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={blockStyle}>
                            <h1 className="titleStyle2">
                                Summer 2021 UPDATES!
                            </h1>
                            <div className="market-text">
                                <p className="bulletUnderline">
                                    <b>Better Math Support</b>{' '}
                                </p>

                                <p>
                                    {' '}
                                    We've added an input box and virtual
                                    keyboard that supports text <b>AND</b> math
                                    expressions!{' '}
                                </p>
                                <MathField
                                    automateScroll={false}
                                    readOnly={false}
                                    value={''}
                                    onChange={(val) => {}}
                                />

                                <p>
                                    You can also submit numerical, algebraic,
                                    and calculus answers during review games.
                                </p>
                                <MathComponent text="{dy/dx = (dy)/(du) * (du)/(dx)}" />

                                <p className="bulletUnderline">
                                    <b>Public Games</b>{' '}
                                </p>

                                <p>
                                    Play games created by other teachers and
                                    educators.
                                </p>

                                <img
                                    src={publicKontest}
                                    style={{
                                        margin: '0 auto',
                                        marginTop: '15px',
                                        width: '95%',
                                        borderRadius: '5%',
                                    }}
                                    alt="teacher page"
                                />

                                <p className="bulletUnderline">
                                    <b>Improved Estimation Games</b>{' '}
                                </p>

                                <p>
                                    It's now easier to input your estimations.
                                    The{' '}
                                    <a
                                        style={{
                                            textDecoration: 'underline',
                                            color: '#118ab2',
                                        }}
                                        onClick={() =>
                                            this.updateModal(true, 'rules', 1)
                                        }
                                    >
                                        game rules
                                    </a>{' '}
                                    have also changed.
                                </p>

                                <div
                                    className="rows"
                                    style={{ textAlign: 'center' }}
                                >
                                    <button
                                        className={
                                            'row ' +
                                            (parseInt(this.state.answerType) ==
                                            1
                                                ? 'estimathon-div-highlighted'
                                                : 'estimathon-div-regular')
                                        }
                                        onClick={() => this.changeAnswerType(1)}
                                    >
                                        <div className="form-inline">
                                            <input
                                                readOnly={true}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: '#073b4c',
                                                    backgroundColor: '#DAF3FC',
                                                    width: '50px',
                                                    marginRight: '-50px',
                                                }}
                                                type="tel"
                                                className="form-control"
                                                name="answerBase"
                                                value={'5'}
                                                placeholder="some base"
                                            />
                                            <h3
                                                className="titleStyle8"
                                                style={{ marginTop: '10px' }}
                                            >
                                                * 10
                                                <sup>
                                                    <input
                                                        readOnly={true}
                                                        style={{
                                                            fontWeight: 'bold',
                                                            color: '#073b4c',
                                                            backgroundColor:
                                                                '#DAF3FC',
                                                            width: '50px',
                                                            marginLeft: '100px',
                                                            marginTop: '-35px',
                                                        }}
                                                        type="tel"
                                                        className="form-control"
                                                        name="answerExp"
                                                        value={'4'}
                                                        placeholder="some exponent"
                                                    />
                                                </sup>
                                            </h3>
                                        </div>
                                    </button>
                                </div>

                                <p className="bulletUnderline">
                                    <b>More Confetti!</b>{' '}
                                </p>

                                <div className="bulletPointDiv">
                                    <button
                                        className="yellow-btn"
                                        onClick={() => {
                                            this.state['confetti'] = true;
                                            this.setState(this.state);
                                        }}
                                    >
                                        Celebration Time!
                                    </button>
                                </div>
                            </div>

                            <br></br>
                        </div>
                    )}

                    {/* {window.innerWidth > MIN_SCREEN

                ?

                <div style={blockStyle}>

            <h1 className='titleStyle2'>Created by 2 high school students:</h1>
                <div className='row2'>
                    <div className='rows2' style={{alignContent:'center', marginRight: "-300px"}}>

                        <img src={ashay} alt="ashay" style={{width:'35%', padding:'0px'}} className={'center'}/>
                        <br/>
                        <h1 style={nameStyle}>Ashay Parikh</h1>


                    </div>

                    <div className='rows2' style={{alignContent:'center'}}>
                        <img src={labdhi} alt="labdhi" style={{width:'35%', padding:'0px'}} className={'center'}/>
                        <br/>
                        <h1 style={nameStyle}>Labdhi Jain</h1>

                    </div>
                </div>
                <p></p>
        </div>

            :

            <div style={blockStyle}>

            <h1 className='titleStyle2'>Created by 2 high school students:</h1>
                <br/>
                <div style = {{display: ""}}>
                    <div className=''>

                        <img src={ashay} alt="ashay" style={{width:'55%'}} className={'center'}/>
                        <br/>
                        <h1 style={nameStyle}>Ashay Parikh</h1>


                    </div>
                    <br/>
                    <div className=''>
                        <img src={labdhi} alt="labdhi" style={{width:'55%'}} className={'center'}/>
                        <br/>
                        <h1 style={nameStyle}>Labdhi Jain</h1>

                    </div>
                </div>
        </div>


    } 

*/}
                </div>

                <br></br>

                {window.innerWidth > MIN_SCREEN ? (
                    <div className="footer">
                        <div className={'row2'}>
                            <div className={'rows2'}></div>

                            <div className={'rows2'}>
                                <h1>
                                    <Link to={'/terms'}>Terms of Service</Link>{' '}
                                    |{' '}
                                    <Link to={'/privacy'}>Privacy Policy</Link>
                                </h1>

                                <h1>
                                    <a href="mailto:team@kontest.us">
                                        Have a question or suggestion? Please
                                        email us!
                                    </a>
                                </h1>
                                <br></br>
                                <h1>©2021 Kontest. All Rights Reserved.</h1>
                            </div>

                            <div className={'rows2'}></div>
                        </div>

                        <RulesModal
                            showModal={this.state.showRules}
                            type={this.state.type}
                            hideModal={() => this.updateModal(false, 'rules')}
                        />
                    </div>
                ) : (
                    <div className="footer">
                        <div>
                            <br></br>
                            <div>
                                <h1>
                                    <Link to={'/terms'}>Terms of Service</Link>{' '}
                                    |{' '}
                                    <Link to={'/privacy'}>Privacy Policy</Link>
                                </h1>

                                <h1>
                                    <a href="mailto:team@kontest.us">
                                        Have a question or suggestion? Please
                                        email us!
                                    </a>
                                </h1>
                                <br></br>
                                <h1>©2021 Kontest. All Rights Reserved.</h1>
                            </div>
                            <br></br>
                        </div>

                        <RulesModal
                            showModal={this.state.showRules}
                            type={this.state.type}
                            hideModal={() => this.updateModal(false, 'rules')}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(Home);
