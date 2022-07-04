import React from 'react';
import Modal from 'react-bootstrap/Modal';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { withRouter } from 'react-router-dom';
import { TextField } from '@material-ui/core';
import Form from 'react-bootstrap/Form';
import { studentRequest } from '../../Request';
import swal from 'sweetalert';

class studentpopup extends React.Component {
    constructor(props) {
        super(props);
        this.saveJoinTeam = this.saveJoinTeam.bind(this);
        this.saveCreateTeam = this.saveCreateTeam.bind(this);
        this.updateState = this.updateState.bind(this);
        this.valueChanged = this.valueChanged.bind(this);

        this.state = {
            studentName: this.props.studentName,
            studentId: this.props.studentId,
            joinTeam: this.props.joinTeam,
            teamName: '',
            allTeams: [],
        };
    }

    componentDidMount() {
        studentRequest(
            'teams/getNames',
            'GET',
            this.props.gameCode,
            {},
            (d) => {
                if (d.success) {
                    var teamNames = [];
                    for (var key of Object.keys(d.data)) {
                        teamNames.push(key);
                    }
                    this.setState({
                        studentName: this.state.studentName,
                        joinTeam: this.state.joinTeam,
                        teamName: this.state.teamName,
                        allTeams: teamNames,
                    });
                } else {
                    swal('Error! Please try again.', '', 'error');
                }
            },
        );
    }

    saveJoinTeam() {
        var teamName = this.state.teamName;

        if (teamName === '') {
            swal('Please enter a valid team name.', '', 'error');
            return;
        }

        //remove spaces after the last character in studentName
        teamName = teamName.replace(/\s*$/, '');

        studentRequest(
            'students/update',
            'POST',
            this.props.gameCode,
            {
                studentName: this.state.studentName,
                studentId: this.state.studentId,
                newTeam: teamName,
                isNew: false,
            },
            (d) => {
                swal(d.message, '', 'info');
                swal(
                    'Once the timer hits zero, the game will start and you will be able to join. Right now, you can close this window or click exit game. To rejoin the game, you can click the rejoin button on the game code page or re-enter your game code, name, and id.',
                    '',
                    'info',
                );
                if (d.success) {
                    this.props.showTeam();
                    this.props.hideModal();
                }
            },
        );
    }

    saveCreateTeam() {
        var teamName = this.state.teamName;

        if (teamName === '') {
            swal('Please enter a valid team name.', '', 'error');
            return;
        }

        //remove spaces after the last character in studentName
        teamName = teamName.replace(/\s*$/, '');

        studentRequest(
            'students/update',
            'POST',
            this.props.gameCode,
            {
                studentName: this.state.studentName,
                studentId: this.state.studentId,
                newTeam: teamName,
                isNew: true,
            },
            (d) => {
                if (d.success) {
                    swal(d.message, '', 'success');
                    this.props.showTeam();
                    this.props.hideModal();
                    this.props.setTeamName(teamName);
                } else {
                    swal(d.message, '', 'error');
                }
            },
        );
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    render() {
        let answerStyle = {
            marginTop: '10px',
            backgroundColor: '#',
        };
        let bgStyle = {
            backgroundColor: '#f5f7fa',
            borderRadius: '10px',
            padding: '1em',
            margin: '2px',
        };

        var addHeader = null;
        var buttonType = null;
        var teamField = null;

        if (this.props.joinTeam) {
            addHeader = <h2>Join Team</h2>;
            buttonType = (
                <button onClick={this.saveJoinTeam} className="yellow-btn">
                    Save
                </button>
            );

            var teamNames = this.state.allTeams;
            let items = [];
            for (var i = 0; i < teamNames.length; i++) {
                items.push(
                    <option key={i} value={teamNames[i]}>
                        {teamNames[i]}
                    </option>,
                );
            }

            teamField = (
                <Form.Control
                    name="teamName"
                    onChange={this.valueChanged}
                    label="Select Team"
                    as="select"
                >
                    <option value="" selected disabled hidden>
                        Select a Team
                    </option>
                    {items}
                </Form.Control>
            );
        } else {
            addHeader = <h2> Create New Team</h2>;
            buttonType = (
                <button onClick={this.saveCreateTeam} className="yellow-btn">
                    Save
                </button>
            );
            teamField = (
                <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Team Name"
                    variant="outlined"
                    name="teamName"
                    onChange={this.valueChanged}
                    defaultValue={this.state.teamName}
                ></TextField>
            );
        }

        return (
            <Modal show={true} onHide={() => this.props.hideModal()}>
                <Modal.Header closeButton>{addHeader}</Modal.Header>

                <Modal.Body style={{ align: 'center' }}>
                    <div style={bgStyle} style={{ align: 'center' }}>
                        <div style={answerStyle}>{teamField}</div>
                        <br />
                        <Modal.Footer>{buttonType}</Modal.Footer>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

export default withRouter(studentpopup);
