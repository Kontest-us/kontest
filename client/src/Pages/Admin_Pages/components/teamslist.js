import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { TextField } from '@material-ui/core';
import Team from './singleteam';
import TeamPopup from '../modals/teampopup';
import Divider from '@material-ui/core/Divider';
import { adminGameRequest } from '../../Request';
import swal from 'sweetalert';
import socketIOClient from 'socket.io-client';
import { url } from '../../Request';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import Tooltip from '@material-ui/core/Tooltip';

var socket;
const ENDPOINT = url;

class Teams extends React.Component {
    constructor(props) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.showModal = this.showModal.bind(this);
        this.clearTeams = this.clearTeams.bind(this);
        this.randomTeams = this.randomTeams.bind(this);
        this.getTeams = this.getTeams.bind(this);

        this.state = {
            data: {}, //all fo the team's data
            teamData: {}, //a specific teams' data
            teamName: '',
            teamModal: false, // team pop up
            newTeam: true,
            search: '',
            teams: {},
        };
    }

    /**
     * called after first render()
     */
    componentDidMount() {
        socket = socketIOClient(ENDPOINT);

        this.getTeams();
        socket.emit('joinGame', this.props.gameID, '', true);
        socket.emit('initialScore', this.props.gameID, '', true);

        // listener for just the team data
        socket.on('teams', (data) => {
            this.state.data = data;
            this.setState(this.state);
        });
    }

    /**
     * call to backend to get teams info
     */
    getTeams() {
        adminGameRequest('teams/get', 'GET', this.props.gameID, {}, (d) => {
            //success
            if (d.success) {
                this.state['data'] = d.data;
                this.setState(this.state);
            } else {
                swal(d.message, '', 'error');

                this.props.redirect();
            }
        });
    }

    componentWillUnmount() {
        socket.off('teams');
        socket.disconnect();
    }

    /**
     * updates single state based on params
     * @param key
     * @param val
     */
    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    /**
     * used only for searchbar textfield
     * @param e
     */
    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    hideModal() {
        this.state['teamModal'] = false;
        this.setState(this.state);
    }

    showModal(teamData, teamName, newTeam) {
        this.state['teamModal'] = true;
        this.state['teamData'] = teamData;
        this.state['teamName'] = teamName;
        this.state['newTeam'] = newTeam;

        this.setState(this.state);
    }
    /**
     * clears teams, DELETE request to backend
     */
    clearTeams() {
        swal({
            title: 'Are you sure?',
            text: 'If you continue, all students, teams, and scores will be deleted. This operation is undoable.',

            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willClear) => {
            if (willClear) {
                adminGameRequest(
                    'teams/clear',
                    'DELETE',
                    this.props.gameID,
                    {},
                    (d) => {
                        if (d.success) {
                            this.getTeams();
                        } else {
                            swal(
                                'Error! Please refresh the page and try again!',
                                '',
                                'error',
                            );
                        }
                    },
                );
            } else {
                return;
            }
        });
    }

    /**
     * randomizes teams, request to backend
     */
    randomTeams() {
        swal({
            title: 'Are you sure?',
            text: 'If you continue, all students will be assigned to a random team. The team scores will also be cleared. This operation is undoable.',

            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                adminGameRequest(
                    'teams/randomTeams',
                    'POST',
                    this.props.gameID,
                    {},
                    (d) => {
                        if (d.success) {
                            swal(d.message, '', 'success');
                        } else {
                            swal(d.message, '', 'error');
                        }

                        this.getTeams();
                    },
                );
            } else {
            }
        });
    }

    render() {
        var teams = [];

        var c = 1;

        console.log(this.state.data);

        //search component below - if the team name matches search value, then we add it to teams array for rendering on the screen

        for (var key of Object.keys(this.state.data)) {
            if (key.toLowerCase().includes(this.state.search.toLowerCase())) {
                teams.push(
                    <Team
                        key={c}
                        gameID={this.props.gameID}
                        teamData={this.state.data[key]}
                        refreshTeams={this.getTeams}
                        teamName={key}
                        openPopup={this.showModal}
                    />,
                );
                c += 1;
            }
        }

        var teamModal = null;

        if (this.state.teamModal) {
            teamModal = (
                <TeamPopup
                    teamData={this.state.teamData}
                    gameID={this.props.gameID}
                    new={this.state.newTeam}
                    refreshTeams={this.getTeams}
                    teamName={this.state.teamName}
                    hideModal={this.hideModal}
                />
            );
        }

        return (
            <div className="pageDiv">
                <br />
                <Divider></Divider>
                <h1 className="pageHeaderSmall">Assign Teams</h1>
                <h1 className="titleStyle1" style={{ fontWeight: 'bold' }}>
                    {c - 1}
                </h1>
                <br />
                <div>
                    <button
                        className="red-btn"
                        style={{ width: '200px', marginRight: '15px' }}
                        onClick={this.clearTeams}
                    >
                        Clear Teams
                    </button>

                    <button
                        className="dark-green-btn"
                        style={{ width: '200px' }}
                        onClick={() => this.showModal({}, '', true)}
                    >
                        Add Team
                    </button>
                    <Tooltip
                        title="Students will be shuffled between teams evenly."
                        arrow
                        placement="top"
                    >
                        <button
                            className="blue-btn"
                            style={{ width: '200px', marginLeft: '15px' }}
                            onClick={this.randomTeams}
                        >
                            Randomize Teams
                        </button>
                    </Tooltip>
                    <br />
                    <br />

                    <i>
                        You don't have to add any teams if you want students to
                        create their own teams.
                    </i>
                    <br />
                    <br />
                    <TextField
                        id="outlined-static"
                        label="Search"
                        rows={4}
                        defaultValue={this.state.search}
                        variant="filled"
                        name="search"
                        onChange={this.valueChanged}
                        style={{ width: '90%' }}
                    >
                        {' '}
                    </TextField>

                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            margin: '0 auto',
                            justifyContent: 'center',
                        }}
                    >
                        {teams}
                    </div>
                </div>

                {!this.props.isFullScreen ? (
                    <AiOutlineFullscreen
                        onClick={this.props.changeFullScreen}
                        className="full-screen-icon"
                    ></AiOutlineFullscreen>
                ) : (
                    <AiOutlineFullscreenExit
                        onClick={this.props.changeFullScreen}
                        className="full-screen-icon"
                    ></AiOutlineFullscreenExit>
                )}

                {teamModal}
            </div>
        );
    }
}

export default Teams;
