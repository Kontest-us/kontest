import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { Link } from 'react-router-dom';
import Toggle from 'react-toggle';

class singlegame extends React.Component {
    constructor(props) {
        super(props);
        this.recentGame = this.recentGame.bind(this);
    }

    recentGame() {
        //add game code to local storage so it appears at the top of the list of games.
        //We store the games from last opened to first opened;

        let recentGamesCodes =
            JSON.parse(localStorage.getItem('recentGames')) || [];
        let currentGameCode = this.props.data.gameCode;

        //don't want to re-add the same game code
        if (recentGamesCodes.indexOf(currentGameCode) == -1) {
            //too many games saved
            if (recentGamesCodes.length == 5) {
                //remove from end
                recentGamesCodes.pop();
            }
            //append to front
            recentGamesCodes.unshift(currentGameCode);
        }

        localStorage.setItem('recentGames', JSON.stringify(recentGamesCodes));
    }

    render() {
        let gameData = this.props.data;
        let isLive = gameData.live;
        let gameCode = gameData.gameCode;
        let gameName = gameData.gameName;
        let gameType = gameData.gameType || '1';

        let bodyClassName;

        if (gameType === '1') {
            bodyClassName = 'light-yellow-div';
        } else {
            bodyClassName = 'light-white-div';
        }

        let textStyle = {
            textAlign: 'left',
            marginRight: '10px',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            color: '#073b4c',
            fontWeight: 'lightest',
            fontSize: '25px',
            padding: 0,
            width: window.innerWidth / 10,
        };

        let textStyle2 = {
            textAlign: 'left',
            marginRight: '10px',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            color: '#073b4c',
            fontWeight: '100',
            fontSize: '25px',
            padding: 0,
            width: window.innerWidth / 10,
        };

        let codeStyle = {
            color: '#073b4c',
            fontWeight: 'bold',
            fontSize: '25px',
            textAlign: 'center',
            textDecoration: 'underline',
        };

        let codeStyle2 = {
            color: '#073b4c',
            fontWeight: 'bold',
            fontSize: '25px',
            textAlign: 'center',
        };

        let liveStyle = {
            color: '#073b4c',
            fontWeight: 'bold',
            fontSize: '20px',
            display: 'inline',
        };

        return (
            <div className={bodyClassName} style={{ height: '125px' }}>
                <div>
                    <div
                        style={{
                            float: 'left',
                            textAlign: 'left',
                            display: 'inline-block',
                        }}
                    >
                        {gameName.length > window.innerWidth / 25 ? (
                            <b style={textStyle}>
                                <b>
                                    {gameName.substring(
                                        0,
                                        window.innerWidth / 25,
                                    )}
                                    ...
                                </b>
                            </b>
                        ) : (
                            <b style={textStyle}>
                                <b>{gameName}</b>
                            </b>
                        )}
                        <br></br>
                        {gameType == '1' ? (
                            <b style={textStyle2}>
                                <b>Estimation</b>
                            </b>
                        ) : (
                            <b style={textStyle2}>
                                <b>Review</b>
                            </b>
                        )}
                    </div>

                    <div
                        style={{
                            float: 'right',
                            textAlign: 'right',
                            display: 'inline-block',
                        }}
                    >
                        <Link to={`/admin/dashboard/${gameCode}`}>
                            <button
                                className="blue-btn"
                                onClick={this.recentGame}
                            >
                                Open
                            </button>
                        </Link>

                        {!this.props.isLimited ? (
                            <>
                                {!isLive ? (
                                    <Link
                                        to={`/admin/dashboard/${gameCode}/play`}
                                    >
                                        <button
                                            className="dark-green-btn"
                                            onClick={this.recentGame}
                                            style={{ marginTop: '5px' }}
                                        >
                                            Play
                                        </button>
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/admin/dashboard/${gameCode}/live`}
                                    >
                                        <button
                                            className="red-btn"
                                            onClick={this.recentGame}
                                            style={{ marginTop: '5px' }}
                                        >
                                            Results
                                        </button>
                                    </Link>
                                )}
                            </>
                        ) : null}
                    </div>

                    <div
                        style={{
                            float: 'right',
                            textAlign: 'center',
                            display: 'inline-block',
                            marginRight: '25px',
                        }}
                    >
                        <b style={codeStyle2}>Code: </b>
                        <b style={codeStyle}>{gameCode}</b>
                    </div>
                </div>
            </div>
        );
    }
}

export default singlegame;
