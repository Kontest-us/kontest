import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import Container from 'react-bootstrap/Container';
import Divider from '@material-ui/core/Divider';
import { url } from '../../Request';
import { socket } from '../Game';

function Scoreboard(props) {
    const [table, setTable] = useState([]);
    const [singleTable, setSingleTable] = useState([]);

    //https://www.valentinog.com/blog/socket-react/

    useEffect(() => {
        socket.emit(
            'initialScore',
            props.gameCode,
            localStorage.getItem('teamName') ?? '',
            false,
        );

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

            //if is an estimathon, lower score wins

            //the table is already sorted on the backend, so we can continue
            //to giving a place to each team

            //update the place based on the ranking above
            for (var i = 0; i < table.length; i++) {
                table[i]['place'] = String(i + 1);
            }

            //update the state variable
            setTable(table);
        });

        // listens for team data only
        socket.on('singleTeamTable', (data) => {
            var tableData = data;

            //format the data received
            var table1 = [];

            //for each team

            var a = {};
            a['name'] = tableData.teamName; //get the team name
            //add a Q for each question and the Score the team recieved

            if (tableData.scores) {
                for (var j = 0; j < tableData.scores.length; j++) {
                    a['Q' + String(j + 1)] = String(tableData.scores[j]);
                }
            }

            a['points'] = String(tableData.totalScore); //number of points
            a['guesses'] = String(tableData.totalGuesses); //guesses

            // updates guesses in parent component
            props.updateGuesses(String(tableData.totalGuesses));

            table1.push(a);

            //update the state variable
            setSingleTable(table1);

            props.updateLoaded();
        });

        socket.on('place', (data) => {
            props.updateState('place', data);
        });

        // CLEAN UP THE EFFECT - needed for avoiding memory leaks
        return () => {
            socket.off('scoreTable');
            socket.off('singleTeamTable');
            socket.off('place');
        };
    }, []);

    function getKeys() {
        if (table.length > 0) {
            return Object.keys(table[0]);
        }
        return Object.keys({});
    }

    function getKeysPersonal() {
        if (singleTable.length > 0) {
            return Object.keys(singleTable[0]);
        }
        return Object.keys({});
    }

    function getHeader() {
        var keys = getKeys();

        if (keys.length === 0) {
            return null;
        } else {
            return keys.map((key, index) => {
                return <th key={key}>{key.toUpperCase()}</th>;
            });
        }
    }

    function getRowsData() {
        var items = table;
        var keys = getKeys();

        if (keys.length === 0) {
            return null;
        }

        return items.map((row, index) => {
            return (
                <tr key={index}>
                    <RenderRow key={index} data={row} keys={keys} />
                </tr>
            );
        });
    }

    function getHeaderPersonal() {
        var keys = getKeysPersonal();

        if (keys.length === 0) {
            return null;
        } else {
            return keys.map((key, index) => {
                return <th key={key}>{key.toUpperCase()}</th>;
            });
        }
    }

    function getRowsDataPersonal() {
        var items = singleTable;
        var keys = getKeys();

        if (keys.length === 0) {
            return null;
        }

        return items.map((row, index) => {
            return (
                <tr key={index}>
                    <RenderRow key={index} data={row} keys={keys} />
                </tr>
            );
        });
    }

    return (
        <div
            style={{
                height: 'fit-content',
                minHeight: window.innerHeight,
                width: window.innerWidth - 275,
                // overflowY: 'scroll',
                backgroundColor: '#f5f7fa',
                borderRadius: '0px',
                border: 'transparent',
            }}
        >
            <br />
            <br />
            <h3 className="gameTitle" style={{ fontWeight: 'bold' }}>
                Live Scoreboard
            </h3>
            <br />
            <Divider></Divider>
            <br />

            {/*put here to get rid of initial weird table*/}
            {singleTable && table.length > 0 ? (
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
                    <h3 className="gameTitle" style={{ fontSize: '30px' }}>
                        Your Scoreboard:
                    </h3>
                    <br></br>
                    <Container fluid={'sm'}>
                        <div style={{ float: 'center' }}>
                            <table style={{ width: '100%', height: '50%' }}>
                                <thead id="table-head">
                                    <tr>{getHeaderPersonal()}</tr>
                                </thead>
                                <tbody id="table-body">
                                    {getRowsDataPersonal()}
                                </tbody>
                            </table>
                        </div>
                    </Container>
                </Card.Body>
            ) : null}

            {table.length > 0 ? (
                <Card.Body
                    style={{
                        width: 'fit-content',
                        height: 'fit-content',
                        alignItems: 'center',
                        maxWidth: '100%',
                        overflow: 'auto',
                    }}
                    className={'center'}
                >
                    <h3 className="gameTitle" style={{ fontSize: '30px' }}>
                        Top {props.numScores}{' '}
                        {parseInt(props.numScores) === 1 ? 'Team' : 'Teams'}:
                    </h3>
                    <br></br>
                    <Container fluid={'sm'}>
                        <div style={{ float: 'center' }}>
                            <table style={{ width: '100%', height: '50%' }}>
                                <thead id="table-head">
                                    <tr>{getHeader()}</tr>
                                </thead>
                                <tbody id="table-body">{getRowsData()}</tbody>
                            </table>
                        </div>
                    </Container>
                </Card.Body>
            ) : (
                <h3 className="gameTitle" style={{ fontSize: '30px' }}>
                    Team Scores are not being shown.
                </h3>
            )}
        </div>
    );
}

export default Scoreboard;

const RenderRow = (props) => {
    var keyNum = 0;

    let studentTeamName = localStorage.getItem('teamName') ?? '';

    function incrementKey() {
        keyNum += 1;
        return keyNum;
    }

    return props.keys.map((key, index) => {
        if (
            key != 'guesses' &&
            key != 'points' &&
            key != 'name' &&
            key != 'place'
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
            } else if (props.data[key] === '0') {
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
            if (props.data[key] === studentTeamName) {
                return (
                    <td
                        style={{
                            backgroundColor: '#69d0f2',
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
                            backgroundColor: '#118AB2',
                            fontWeight: 'bold',
                            color: 'white',
                        }}
                        key={incrementKey()}
                    >
                        {props.data[key]}
                    </td>
                );
            }
        } else {
            if (key === 'place' && props.data[key]) {
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
            } else if (key !== 'place') {
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
        }
    });
};
