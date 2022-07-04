import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';

import Modal from 'react-bootstrap/Modal';

import Math from '../../Math';

import Question from '../components/singlequestion';

function RulesModal(props) {
    const [page, setPage] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(30);

    let goBack = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    let goForward = () => {
        if (page < 2) {
            setPage(page + 1);
        }
    };

    useEffect(() => {
        let interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds((seconds) => seconds - 1);
            } else if (minutes > 0) {
                setSeconds(59);
                setMinutes(minutes - 1);
            } else {
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [minutes, seconds]);

    let format = (s) => {
        if (s < 10) {
            return '0' + s;
        }
        return s;
    };

    if (parseInt(props.type) === 1) {
        //estimathon contest

        let body = null;
        let buttons = null;

        if (page === 0) {
            body = (
                <>
                    <h5 className="titleStyle6">
                        You and your team will be given a set of tricky
                        questions:
                    </h5>
                    <Question
                        gameCode={'A'}
                        showSubmitQuestionModal={(a, b) => {}}
                        answersGuessed={''}
                        guesses={0}
                        color={{ color: '#f8fafd', removeChoice: true }}
                        key={2}
                        ind={1}
                        question={{
                            image: '',
                            choices: [],
                            q: 'How much does an elephant weight in grams?',
                            type: 'e',
                            a: '',
                        }}
                    ></Question>

                    <br />
                    <h5 className="titleStyle6">
                        Each question has a correct, positive answer that can be
                        small, like 8, or enormous, like 4 * 10 <sup>15</sup>.
                        <br />
                        <br />
                        <b>HOWEVER, when you answer</b>, you have to submit a{' '}
                        <b>range</b> of numbers that contains the correct
                        answer.
                    </h5>

                    <br />
                    <br />

                    <div className="form-inline" style={{ margin: '0 auto' }}>
                        <div style={{ margin: '0 auto' }}>
                            <p className="titleStyle4">Lower Guess</p>

                            <button
                                className={'row estimathon-div-highlighted'}
                            >
                                <input
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#073b4c',
                                        backgroundColor: '#DAF3FC',
                                        margin: 'auto',
                                        width: '150px',
                                    }}
                                    type="tel"
                                    className="form-control"
                                    name="highBound"
                                    value={''}
                                    placeholder="some number"
                                />
                            </button>
                        </div>

                        <div
                            style={{
                                fontSize: '25px',
                                fontWeight: 'bold',
                                color: '#073b4c',
                            }}
                        >
                            <Math text="{<=} correct answer {<=}" />
                        </div>

                        <div style={{ margin: '0 auto' }}>
                            <p className="titleStyle4">Upper Guess</p>

                            <button
                                className={'row estimathon-div-highlighted'}
                            >
                                <input
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#073b4c',
                                        backgroundColor: '#DAF3FC',
                                        margin: 'auto',
                                        width: '150px',
                                    }}
                                    type="tel"
                                    className="form-control"
                                    name="highBound"
                                    value={''}
                                    placeholder="another number"
                                />
                            </button>
                        </div>
                    </div>
                </>
            );
            buttons = (
                <>
                    <button
                        className="light-green-btn"
                        style={{
                            margin: '0 auto',
                            marginBottom: '15px',
                            width: '400px',
                        }}
                        onClick={goForward}
                    >
                        Continue
                    </button>
                </>
            );
        } else if (page === 1) {
            body = (
                <>
                    <h5 className="titleStyle6">
                        Only one person on your team has to submit a correct
                        range.
                        <br />
                        <br />
                        For every unanswered or incorrectly answered question,
                        you earn <b>1000</b> points.
                        <br />
                        <br />
                        If you answer a question correctly, you earn points
                        based on the distance between your <b>lower guess </b>
                        and <b>upper guess</b>. The smaller the distance, the
                        better!
                        <br />
                        <br />
                    </h5>
                    <h5 className="titleStyle5">
                        <Math
                            text={
                                '(Behind the scenes, we use this formula: points {= floor((upper)/(lower)}, where {floor(_)} means rounding down)'
                            }
                        />
                    </h5>

                    <br />
                    <br />
                    <h5 className="titleStyle6">
                        To win the game, your team must have the{' '}
                        <b style={{ textDecoration: 'underline' }}>
                            {' '}
                            least total points.
                        </b>
                    </h5>

                    <br></br>
                </>
            );

            buttons = (
                <>
                    <button
                        className="light-green-btn"
                        style={{
                            margin: '0 auto',
                            marginBottom: '15px',
                            width: '400px',
                        }}
                        onClick={goForward}
                    >
                        Continue
                    </button>
                    <button
                        className="red-btn"
                        style={{ margin: '0 auto', width: '400px' }}
                        onClick={goBack}
                    >
                        Back
                    </button>
                </>
            );
        } else if (page === 2) {
            body = (
                <>
                    <h5 className="titleStyle6">
                        However, be careful because the game will eventually
                        end.
                    </h5>

                    <h1
                        className="big"
                        style={{ fontSize: '35px', color: '#EF476F' }}
                    >
                        {minutes}:{format(seconds)}
                    </h1>

                    <h5 className="titleStyle6">
                        Also, each time you answer a question, your team loses a
                        guess.
                    </h5>
                    <br />
                    <br />
                    <h1 className="gameTitle" style={{ fontWeight: 'bold' }}>
                        10/20
                    </h1>
                    <h1 className="gameTitle" style={{ fontSize: '30px' }}>
                        Guess Count
                    </h1>

                    <br />

                    <h5 className="titleStyle4">How to win:</h5>
                    <div
                        style={{
                            color: '#073b4c',
                            fontSize: '20px',
                            fontWeight: '400',
                            textAlign: 'left',
                            height: 'fit-content',
                            width: 'fit-content',
                            margin: '0 auto',
                        }}
                    >
                        <li>
                            <b>Work together on estimating</b>
                        </li>
                        <li>Keep your range distance small</li>
                        <li>Watch the game timer</li>
                        <li style={{ textDecoration: 'underline' }}>
                            <b>Earn the least points!</b>
                        </li>
                    </div>

                    <div
                        style={{
                            textAlign: 'center',
                            alignContent: 'center',
                            margin: '0 auto',
                            marginTop: '15px',
                        }}
                    >
                        <table
                            style={{
                                width: '400px',
                                height: 'fit-content',
                                margin: '0 auto',
                            }}
                        >
                            <thead id="table-head">
                                <th>NAME</th>
                                <th>POINTS</th>
                                <th>GUESSES</th>
                                <th>PLACE</th>
                            </thead>
                            <tbody id="table-body">
                                <tr key={2}>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={1}
                                    >
                                        Funky Estimators
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {10}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {20}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#06D6A0',
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}
                                        key={3}
                                    >
                                        {1}
                                    </td>
                                </tr>

                                <tr key={2}>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={1}
                                    >
                                        Number Ninjas
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {30}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {17}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#fff',
                                            color: 'black',
                                        }}
                                        key={3}
                                    >
                                        {2}
                                    </td>
                                </tr>

                                <tr key={2}>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={1}
                                    >
                                        Team Mathletes
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {50}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {12}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#fff',
                                            color: 'black',
                                        }}
                                        key={3}
                                    >
                                        {3}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            );

            buttons = (
                <>
                    <button
                        className="light-green-btn"
                        style={{
                            margin: '0 auto',
                            marginBottom: '15px',
                            width: '400px',
                        }}
                        onClick={props.hideModal}
                    >
                        Good Luck and Have Fun
                    </button>
                    <button
                        className="red-btn"
                        style={{
                            margin: '0 auto',
                            marginBottom: '15px',
                            width: '400px',
                        }}
                        onClick={goBack}
                    >
                        Back
                    </button>
                </>
            );
        }

        return (
            <Modal
                size="lg"
                style={{ textAlign: 'center', padding: '20px' }}
                show={props.showModal}
                onHide={props.hideModal}
            >
                <Modal.Header closeButton>
                    <br /> <br />
                    <i
                        style={{
                            textAlign: 'center',
                            color: '#073b4c',
                            margin: '15px',
                            fontSize: '35px',
                            fontWeight: 'bold',
                        }}
                    >
                        How-to-play: Estimation Game
                    </i>
                </Modal.Header>

                <Modal.Body
                    style={{
                        textAlign: 'center',
                        alignContent: 'center',
                        marginLeft: '40px',
                        marginRight: '40px',
                    }}
                >
                    {body}
                </Modal.Body>

                <Modal.Footer
                    style={{
                        textAlign: 'center',
                        margin: '0 auto',
                        fontSize: '25px',
                        fontWeight: 'bold',
                    }}
                >
                    {buttons}
                </Modal.Footer>
            </Modal>
        );
    } else if (parseInt(props.type) === 2) {
        //review game

        let body = null;
        let buttons = null;

        if (page === 0) {
            body = (
                <>
                    <h5 className="titleStyle6">
                        You and your team will get a set of multiple choice and
                        single answer questions.
                    </h5>
                    <Question
                        gameCode={'A'}
                        showSubmitQuestionModal={(a, b) => {}}
                        answersGuessed={''}
                        guesses={0}
                        color={{ color: '#f8fafd', removeChoice: true }}
                        key={2}
                        ind={1}
                        question={{
                            image: '',
                            choices: [
                                '"Pacific Ocean"',
                                '"Atlantic Ocean"',
                                '"Indian Ocean"',
                                '"Arctic Ocean"',
                            ],
                            multiplier: 20,
                            q: 'What is the largest ocean in the world?',
                            type: 'm',
                            a: '',
                        }}
                    ></Question>

                    <br></br>

                    <h5 className="titleStyle6">
                        The game will go on for a certain amount of time.
                    </h5>

                    <h1
                        className="big"
                        style={{ fontSize: '35px', color: '#EF476F' }}
                    >
                        {minutes}:{format(seconds)}
                    </h1>
                </>
            );
            buttons = (
                <>
                    <button
                        className="light-green-btn"
                        style={{
                            margin: '0 auto',
                            marginBottom: '15px',
                            width: '400px',
                        }}
                        onClick={goForward}
                    >
                        Continue
                    </button>
                </>
            );
        } else if (page === 1) {
            body = (
                <>
                    <h5 className="titleStyle6">
                        Earn points by answering questions correctly. Only one
                        person has to submit a correct answer.
                    </h5>

                    <div
                        style={{
                            textAlign: 'center',
                            alignContent: 'center',
                            margin: '0 auto',
                            marginTop: '15px',
                        }}
                    >
                        <table
                            style={{
                                width: '200px',
                                height: 'fit-content',
                                margin: '0 auto',
                            }}
                        >
                            <thead id="table-head"></thead>
                            <tbody id="table-body">
                                <tr key={1}>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={3}
                                    >
                                        Q1
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={4}
                                    >
                                        Q2
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={5}
                                    >
                                        Q3
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={5}
                                    >
                                        Q4
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={5}
                                    >
                                        Q5
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={5}
                                    >
                                        POINTS
                                    </td>
                                </tr>
                                <tr key={2}>
                                    <td
                                        style={{
                                            backgroundColor: '#aaf0d1',
                                        }}
                                        key={1}
                                    >
                                        {5}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#CC9999',
                                        }}
                                        key={2}
                                    >
                                        X
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#aaf0d1',
                                        }}
                                        key={3}
                                    >
                                        {10}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#aaf0d1',
                                        }}
                                        key={3}
                                    >
                                        {10}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#aaf0d1',
                                        }}
                                        key={3}
                                    >
                                        {25}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {50}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <br></br>
                    <h5 className="titleStyle6">
                        There are partial points for multiple choice questions
                        if you answered more than once.
                    </h5>

                    <Question
                        gameCode={'A'}
                        showSubmitQuestionModal={(a, b) => {}}
                        answersGuessed={'"Atlantic Ocean"`"Indian Ocean"'}
                        guesses={2}
                        color={{ color: '#f8fafd', removeChoice: true }}
                        key={2}
                        ind={1}
                        question={{
                            image: '',
                            choices: [
                                '"Pacific Ocean"',
                                '"Atlantic Ocean"',
                                '"Indian Ocean"',
                                '"Arctic Ocean"',
                            ],
                            multiplier: 20,
                            q: 'What is the largest ocean in the world?',
                            type: 'm',
                            a: '"Pacific Ocean"',
                        }}
                    ></Question>

                    <br></br>
                </>
            );

            buttons = (
                <>
                    <button
                        className="light-green-btn"
                        style={{
                            margin: '0 auto',
                            marginBottom: '15px',
                            width: '400px',
                        }}
                        onClick={goForward}
                    >
                        Continue
                    </button>
                    <button
                        className="red-btn"
                        style={{ margin: '0 auto', width: '400px' }}
                        onClick={goBack}
                    >
                        Back
                    </button>
                </>
            );
        } else if (page === 2) {
            body = (
                <>
                    <h5 className="titleStyle6">
                        Each time you answer a question, your team loses a
                        guess.
                    </h5>
                    <br />
                    <br />
                    <h1 className="gameTitle" style={{ fontWeight: 'bold' }}>
                        10/20
                    </h1>
                    <h1 className="gameTitle" style={{ fontSize: '30px' }}>
                        Guess Count
                    </h1>

                    <br />

                    <h5 className="titleStyle4">How to win:</h5>
                    <div
                        style={{
                            color: '#073b4c',
                            fontSize: '20px',
                            fontWeight: '400',
                            textAlign: 'left',
                            height: 'fit-content',
                            width: 'fit-content',
                            margin: '0 auto',
                        }}
                    >
                        <li>
                            <b>Work together on questions</b>
                        </li>
                        <li>Don't use up all your guesses</li>
                        <li>Watch the game timer</li>
                        <li>
                            <b>Earn the most points!</b>
                        </li>
                    </div>

                    <div
                        style={{
                            textAlign: 'center',
                            alignContent: 'center',
                            margin: '0 auto',
                            marginTop: '15px',
                        }}
                    >
                        <table
                            style={{
                                width: '400px',
                                height: 'fit-content',
                                margin: '0 auto',
                            }}
                        >
                            <thead id="table-head">
                                <th>NAME</th>
                                <th>POINTS</th>
                                <th>GUESSES</th>
                                <th>PLACE</th>
                            </thead>
                            <tbody id="table-body">
                                <tr key={2}>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={1}
                                    >
                                        Funky Wizards
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {50}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {20}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#06D6A0',
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}
                                        key={3}
                                    >
                                        {1}
                                    </td>
                                </tr>

                                <tr key={2}>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={1}
                                    >
                                        Number Ninjas
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {30}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {17}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#fff',
                                            color: 'black',
                                        }}
                                        key={3}
                                    >
                                        {2}
                                    </td>
                                </tr>

                                <tr key={2}>
                                    <td
                                        style={{
                                            backgroundColor: '#3a6e7f',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        }}
                                        key={1}
                                    >
                                        History Heros
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {10}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#ffffff',
                                        }}
                                        key={3}
                                    >
                                        {12}
                                    </td>
                                    <td
                                        style={{
                                            backgroundColor: '#fff',
                                            color: 'black',
                                        }}
                                        key={3}
                                    >
                                        {3}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            );

            buttons = (
                <>
                    <button
                        className="light-green-btn"
                        style={{
                            margin: '0 auto',
                            marginBottom: '15px',
                            width: '400px',
                        }}
                        onClick={props.hideModal}
                    >
                        Good Luck and Have Fun
                    </button>
                    <button
                        className="red-btn"
                        style={{
                            margin: '0 auto',
                            marginBottom: '15px',
                            width: '400px',
                        }}
                        onClick={goBack}
                    >
                        Back
                    </button>
                </>
            );
        }

        return (
            <Modal
                size="lg"
                style={{ textAlign: 'center', padding: '20px' }}
                show={props.showModal}
                onHide={props.hideModal}
            >
                <Modal.Header closeButton>
                    <br /> <br />
                    <i
                        style={{
                            textAlign: 'center',
                            color: '#073b4c',
                            margin: '15px',
                            fontSize: '35px',
                            fontWeight: 'bold',
                        }}
                    >
                        How-to-play: Review Game
                    </i>
                </Modal.Header>

                <Modal.Body
                    style={{
                        textAlign: 'center',
                        alignContent: 'center',
                        marginLeft: '40px',
                        marginRight: '40px',
                    }}
                >
                    {body}
                </Modal.Body>

                <Modal.Footer
                    style={{
                        textAlign: 'center',
                        margin: '0 auto',
                        fontSize: '25px',
                        fontWeight: 'bold',
                    }}
                >
                    {buttons}
                </Modal.Footer>
            </Modal>
        );
    } else {
        return null;
    }
}

export default RulesModal;
