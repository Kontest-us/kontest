import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import Container from 'react-bootstrap/Container';
import Divider from '@material-ui/core/Divider';
import { url } from '../../Request';
import swal from 'sweetalert';
import MathText from '../../Math';
import { Download } from './download_parts/document';
import { adminGameRequest } from '../../Request';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';

import socketIOClient from 'socket.io-client';
const ENDPOINT = url;

var socket;

function AdminScoreboard(props) {
    const [scoreTable, setScoreTable] = useState([]);
    const [answerTable, setAnswerTable] = useState([]);
    const [showAnswers, setShowAnswers] = useState(false);
    const [adminMessage, updateMessage] = useState('');

    //get the game name

    //https://www.valentinog.com/blog/socket-react/

    const [time] = useState(props.time);

    function getText(days, hours, minutes, seconds) {
        if (days.toString().length === 1) {
            days = '0' + days;
        }

        if (hours.toString().length === 1) {
            hours = '0' + hours;
        }

        if (minutes.toString().length === 1) {
            minutes = '0' + minutes;
        }

        if (seconds.toString().length < 2) {
            seconds = '0' + seconds;
        }

        return days + ':' + hours + ':' + minutes + ':' + seconds;
    }

    useEffect(() => {
        //create connection
        socket = socketIOClient(ENDPOINT);

        //the current game's uid
        let gameUID = props.gameCode;

        //notify that you wish to monitor the game
        socket.emit('joinGame', gameUID, '', true);

        //get initial data
        socket.emit('initialScore', gameUID, '', true);

        //listener for any changes to the score
        socket.on('scoreTable', (data) => {
            var tableData = data.table;

            //format the data received
            var table = [];

            //for each team
            for (var i = 0; i < tableData.length; i++) {
                var a = {};
                a['name'] = tableData[i].teamName; //get the team name
                //add a Q for each question and the Score the team recieved
                for (var j = 0; j < tableData[i].scores.length; j++) {
                    a['Q' + String(j + 1)] = String(tableData[i].scores[j]);
                }
                a['points'] = String(tableData[i].totalScore); //number of points
                a['guesses'] = String(tableData[i].totalGuesses); //guesses
                table.push(a);
            }

            //update the place based on the ranking above
            for (var i = 0; i < table.length; i++) {
                table[i]['place'] = String(i + 1);
            }

            // now we create the answer table

            var ansTable = [];

            //format the data received

            //for each team
            for (var i = 0; i < tableData.length; i++) {
                var b = {};
                b['name'] = tableData[i].teamName; //get the team name
                //add a Q for each question and the Score the team received
                for (var j = 0; j < tableData[i].answers.length; j++) {
                    b['Q' + String(j + 1)] = String(tableData[i].answers[j]);
                }
                b['points'] = String(tableData[i].totalScore); //number of points
                b['guesses'] = String(tableData[i].totalGuesses); //guesses
                ansTable.push(b);
            }

            //rank the teams based on points. The less points, the higher the rank
            ansTable.sort((a, b) => {
                if (parseFloat(a.points) < parseFloat(b.points)) {
                    return 1;
                } else if (parseFloat(a.points) === parseFloat(b.points)) {
                    //if the same number of points, then rank by number of guesses
                    return parseFloat(a.guesses) > parseFloat(b.guesses)
                        ? 1
                        : -1; //less guesses, higher rank
                }
                return -1;
            });

            //update the place based on the ranking above
            for (var i = 0; i < ansTable.length; i++) {
                ansTable[i]['place'] = String(i + 1);
            }

            setScoreTable(table);
            setAnswerTable(ansTable);
        });

        // CLEAN UP THE EFFECT - needed for avoiding memory leaks
        return () => {
            socket.disconnect();
        };
    }, [props.gameCode]);

    function getKeys(table) {
        if (table.length > 0) {
            return Object.keys(table[0]);
        }
        return Object.keys({});
    }

    function toggleShowAnswers() {
        setShowAnswers(!showAnswers);
    }

    function getHeader(table) {
        var keys = getKeys(table);

        if (keys.length === 0) {
            return null;
        } else {
            return keys.map((key, index) => {
                return <th key={key}>{key.toUpperCase()}</th>;
            });
        }
    }

    function getRowsData(table, toggleButtonText) {
        var items = table;
        var keys = getKeys(table);

        if (keys.length === 0) {
            return null;
        }

        return items.map((row, index) => {
            return (
                <tr key={index}>
                    <RenderRow
                        key={index}
                        data={row}
                        keys={keys}
                        toggleValue={toggleButtonText}
                    />
                </tr>
            );
        });
    }

    function clearTable() {
        swal({
            title: 'Are you sure?',
            text: 'If you continue, all team scores will be cleared. This operation is undoable.',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                adminGameRequest(
                    'game/clearTable',
                    'POST',
                    props.gameCode,
                    {},
                    (d) => {
                        if (d.success) {
                            swal(
                                'Student scores have been cleared!',
                                '',
                                'success',
                            );
                        } else {
                            swal(d.message, '', 'error');
                        }
                    },
                );
            } else {
            }
        });
    }

    function sendMessage() {
        socket.emit('sendMessage', props.gameCode, adminMessage);
        swal('The message has been sent!', '', 'success');
        updateMessage('');
    }

    function updateAdminMessage(e) {
        updateMessage(e.target.value);
    }

    return (
        <div className="pageDiv">
            <br />

            <Divider></Divider>

            <Card.Body
                style={{
                    width: 'fit-content',
                    height: 'fit-content',
                    textAlign: 'center',
                    alignContent: 'center',
                    left: '50%',
                    margin: 'auto',
                    maxWidth: '100%',
                    overflow: 'auto',
                }}
                className={'center'}
            >
                <Container fluid={'sm'}>
                    <div
                        style={{ textAlign: 'center', alignContent: 'center' }}
                    >
                        <table style={{ width: '100%', height: '100%' }}>
                            <thead id="table-head">
                                <tr>{getHeader(scoreTable)}</tr>
                            </thead>
                            <tbody id="table-body">
                                {getRowsData(scoreTable, 'View Answers')}
                            </tbody>
                        </table>
                    </div>
                </Container>
            </Card.Body>

            <br />
            <button
                className="red-btn"
                style={{ width: '200px', marginLeft: '10px' }}
                onClick={clearTable}
            >
                Clear Team Scores
            </button>

            <Download
                gameCode={props.gameCode}
                scores={scoreTable}
                answers={answerTable}
            ></Download>
            <br />
            <br />

            <div className="form-group">
                <input
                    style={{ margin: 'auto', width: '400px' }}
                    className="form-control"
                    name="adminMessage"
                    value={adminMessage}
                    placeholder="Enter your message here..."
                    onChange={updateAdminMessage}
                />
                <br></br>
                <button
                    className="form-control dark-green-btn"
                    style={{
                        align: 'center',
                        margin: '0 auto',
                        width: '400px',
                    }}
                    onClick={sendMessage}
                >
                    Send Message to Students
                </button>
            </div>
            <br></br>
            <Divider></Divider>
            <br></br>
            <button
                className="blue-btn"
                style={{ align: 'center', margin: '0 auto', width: '400px' }}
                onClick={toggleShowAnswers}
            >
                {showAnswers ? 'Hide Team Answers' : 'Show Team Answers'}
            </button>

            {showAnswers ? (
                <Card.Body
                    style={{
                        width: 'fit-content',
                        height: 'fit-content',
                        textAlign: 'center',
                        alignContent: 'center',
                        left: '50%',
                        margin: 'auto',
                        maxWidth: '100%',
                        overflow: 'auto',
                    }}
                    className={'center'}
                >
                    <Container fluid={'sm'}>
                        <div
                            style={{
                                textAlign: 'center',
                                alignContent: 'center',
                            }}
                        >
                            <table style={{ width: '100%', height: '100%' }}>
                                <thead id="table-head">
                                    <tr>{getHeader(answerTable)}</tr>
                                </thead>
                                <tbody id="table-body">
                                    {getRowsData(answerTable, 'View Score')}
                                </tbody>
                            </table>
                        </div>
                    </Container>
                </Card.Body>
            ) : null}

            {!props.isFullScreen ? (
                <AiOutlineFullscreen
                    onClick={props.changeFullScreen}
                    className="full-screen-icon"
                ></AiOutlineFullscreen>
            ) : (
                <AiOutlineFullscreenExit
                    onClick={props.changeFullScreen}
                    className="full-screen-icon"
                ></AiOutlineFullscreenExit>
            )}
        </div>
    );
}

export default AdminScoreboard;

const RenderRow = (props) => {
    var keyNum = 0;

    function incrementKey() {
        keyNum += 1;
        return keyNum;
    }

    return props.keys.map((key, index) => {
        if (
            key !== 'guesses' &&
            key !== 'points' &&
            key !== 'name' &&
            key !== 'place'
        ) {
            if ((props.data[key] + '').includes('X')) {
                return (
                    <td
                        style={{
                            backgroundColor: '#CC9999',
                        }}
                        key={incrementKey()}
                    >
                        {props.data[key]}
                    </td>
                );
            } else if (props.data[key] === '0' || props.data[key] === '') {
                return (
                    <td
                        style={{
                            backgroundColor: '#FAFAD2',
                            color: 'gray',
                        }}
                        key={incrementKey()}
                    >
                        N/A
                    </td>
                );
            } else {
                if (props.toggleValue === 'View Answers') {
                    return (
                        <td
                            style={{
                                backgroundColor: '#aaf0d1',
                                color: 'black',
                            }}
                            key={incrementKey()}
                        >
                            {props.data[key]}
                        </td>
                    );
                } else {
                    return (
                        <td
                            style={{
                                backgroundColor: '#ffffff',
                                color: 'black',
                            }}
                            key={incrementKey()}
                        >
                            <MathText text={'{' + props.data[key] + '}'} />
                        </td>
                    );
                }
            }
        } else if (key === 'place' && props.data[key] === '1') {
            return (
                <td
                    style={{
                        backgroundColor: '#06D6A0',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                    key={incrementKey()}
                >
                    {props.data[key]}
                </td>
            );
        } else if (key === 'name') {
            return (
                <td
                    style={{
                        backgroundColor: '#3a6e7f',
                        fontWeight: 'bold',
                        color: 'white',
                    }}
                    key={incrementKey()}
                >
                    {props.data[key]}
                </td>
            );
        } else {
            return (
                <td
                    style={{
                        backgroundColor: '#FFFFFF',
                    }}
                    key={incrementKey()}
                >
                    {props.data[key]}
                </td>
            );
        }
    });
};
