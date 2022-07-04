import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import SingleTeam from './teamcard';
import Divider from '@material-ui/core/Divider';
import waiting from '../../../style/assets/tenor.gif';
import socketIOClient from 'socket.io-client';

import { url } from '../../Request';

var socket;
const ENDPOINT = url;

class teams extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            teams: {},
        };
    }

    componentDidMount() {
        socket = socketIOClient(ENDPOINT);

        socket.emit(
            'joinGame',
            this.props.gameCode,
            this.props.teamName,
            false,
        );
        socket.emit(
            'initialScore',
            this.props.gameCode,
            this.props.teamName,
            false,
        );

        // listener for just the team data
        socket.on('teams', (data) => {
            this.state.teams = data;

            if (Object.keys(data).length === 0) {
                this.props.setTeamName('');
            } else {
                //find the team name
                let newTeamName = '';

                for (var key of Object.keys(data)) {
                    let students = data[key]['allStudents'] || [];
                    for (var i = 0; i < students.length; i++) {
                        if (students[i]['name'] === this.props.studentName) {
                            newTeamName = key;
                            break;
                        }
                    }
                }

                this.props.setTeamName(newTeamName);
            }

            this.setState(this.state);
        });
    }

    componentWillUnmount() {
        socket.off('teams');
        socket.disconnect();
    }

    render() {
        let textStyle = {
            color: '#093145',
            fontSize: '25px',
            marginBottom: '5px',
            fontWeight: 'bold',
            wordWrap: 'break-word',
        };

        var i = 0;
        function incrementCount() {
            i += 1;
            return i;
        }

        function getCount() {
            return i;
        }
        let bgStyle = {
            backgroundColor: '#f6f8fb',

            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            margin: '15px',
            width: '500px',
        };

        var allTeams = [];

        var count = 1;
        for (var key in this.state.teams) {
            count++;

            let showLeaveButton = this.props.teamName === key;

            allTeams.push(
                <SingleTeam
                    key={key}
                    showLeaveButton={showLeaveButton}
                    studentFreedom={this.props.studentFreedom}
                    maxPerTeam={this.props.maxPerTeam}
                    setTeamName={this.props.setTeamName}
                    gameCode={this.props.gameCode}
                    key={count}
                    studentName={this.props.studentName}
                    studentId={this.props.studentId}
                    onClickTeam={this.onClickTeam}
                    leaveTeam={this.props.leaveTeam}
                    actualTeamName={this.props.teamName}
                    teamName={key}
                    studentArray={this.state.teams[key]['allStudents']}
                >
                    {' '}
                </SingleTeam>,
            );
        }

        return (
            <div className="invisible-fullwidth">
                <br />
                <br />
                <br />
                <br />
                <h1 className="gameTitle " style={{ fontWeight: 'bold' }}>
                    Teams
                </h1>

                <br />
                {parseInt(this.props.studentFreedom) === 3 &&
                this.props.teamName === '' ? (
                    <button
                        className="dark-green-btn"
                        style={{ width: '200px' }}
                        onClick={() => this.props.showCreateTeamsModal()}
                    >
                        {' '}
                        Create Team{' '}
                    </button>
                ) : null}

                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        margin: '0 auto',
                        justifyContent: 'center',
                    }}
                >
                    {allTeams}
                </div>
            </div>
        );
    }
}

export default teams;
