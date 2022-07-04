import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import Particle from '../../Particle.tsx';
import { Link } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import swal from 'sweetalert';
import { FiHome } from 'react-icons/fi';

var MIN_SCREEN = 700;

export default function GameCode(props) {
    var studentName = localStorage.getItem('studentName');
    var gameCode = localStorage.getItem('gameCode');
    var studentId = localStorage.getItem('studentId');

    if (window.innerWidth <= MIN_SCREEN) {
        swal(
            'Warning: your screen is a bit too small. As a result, some of our features may be off your screen or not properly work.',
            '',
            'warning',
        );
    }

    if (studentName && gameCode) {
        //give student an option to join an old game

        return (
            <div className={'App'}>
                <Particle />

                {props.errorBox}
                <Navbar
                    fixed="top"
                    variant="dark"
                    className="nav-bar transparent"
                >
                    <Nav className="mr-auto"></Nav>
                    <Link to="/">
                        <FiHome
                            color="white"
                            size="65px"
                            style={{ margin: '2px' }}
                        />
                    </Link>
                </Navbar>

                <div className="inner-div">
                    <h3 className="titleStyle">Kontest</h3>
                    <br />
                    {props.isSample ? (
                        <>
                            <div className="form-group">
                                <button
                                    className="blue-btn"
                                    style={{ width: '400px' }}
                                    onClick={() => props.playSampleGame('EST6')}
                                >
                                    Play Estimation Game
                                </button>
                            </div>

                            <div className="form-group">
                                <button
                                    className="red-btn"
                                    style={{ width: '400px' }}
                                    onClick={() => props.playSampleGame('MAT1')}
                                >
                                    Play Math Review Game
                                </button>
                            </div>

                            <div className="form-group">
                                <button
                                    className="dark-green-btn"
                                    style={{ width: '400px' }}
                                    onClick={() => props.playSampleGame('TRI1')}
                                >
                                    Play Trivia Game
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{
                                        textAlign: 'center',
                                        width: '400px',
                                        height: '50px',
                                        fontSize: '20px',
                                    }}
                                    name="gameCode"
                                    value={props.gameCode}
                                    placeholder="Enter game code"
                                    onChange={props.valueChanged}
                                />
                            </div>

                            <div className="form-group">
                                <button
                                    className="light-green-btn"
                                    style={{ width: '400px' }}
                                    onClick={props.enterGameCode}
                                >
                                    Enter
                                </button>
                            </div>

                            <div className="form-group">
                                <button
                                    className="blue-btn"
                                    style={{ width: '400px' }}
                                    onClick={() =>
                                        props.joinOldGame(
                                            studentName,
                                            gameCode,
                                            studentId,
                                        )
                                    }
                                >
                                    Join {gameCode} as {studentName}
                                </button>
                            </div>
                        </>
                    )}

                    <br />
                </div>

                <br></br>
            </div>
        );
    }

    //join new game
    return (
        <div className={'App'}>
            <Particle />
            {props.errorBox}

            <Navbar fixed="top" variant="dark" className="nav-bar transparent">
                <Nav className="mr-auto"></Nav>
                <Link to="/">
                    <FiHome
                        color="white"
                        size="65px"
                        style={{ margin: '2px' }}
                    />
                </Link>
            </Navbar>

            <div className="inner-div">
                <h3 className="titleStyle">Kontest</h3>
                <br />
                {props.isSample ? (
                    <>
                        <div className="form-group">
                            <button
                                className="dark-green-btn"
                                style={{ width: '400px' }}
                                onClick={() => props.playSampleGame('TRI1')}
                            >
                                Play Trivia Game
                            </button>
                        </div>

                        <div className="form-group">
                            <button
                                className="blue-btn"
                                style={{ width: '400px' }}
                                onClick={() => props.playSampleGame('EST6')}
                            >
                                Play Estimation Game
                            </button>
                        </div>

                        <div className="form-group">
                            <button
                                className="red-btn"
                                style={{ width: '400px' }}
                                onClick={() => props.playSampleGame('MAT1')}
                            >
                                Play Math Game
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                style={{
                                    textAlign: 'center',
                                    width: '400px',
                                    height: '50px',
                                    fontSize: '20px',
                                }}
                                name="gameCode"
                                value={props.gameCode}
                                placeholder="Enter game code"
                                onChange={props.valueChanged}
                            />
                        </div>

                        <div className="form-group">
                            <button
                                className="light-green-btn"
                                style={{ width: '400px' }}
                                onClick={props.enterGameCode}
                            >
                                Enter
                            </button>
                        </div>
                    </>
                )}
            </div>

            <br></br>
        </div>
    );
}
