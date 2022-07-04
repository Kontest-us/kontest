import React from 'react';
import Modal from 'react-bootstrap/Modal';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { withRouter } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { MDBCloseIcon, MDBModalFooter } from 'mdbreact';
import { TextField } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { adminGameRequest } from '../../Request';
import swal from 'sweetalert';
import Tooltip from '@material-ui/core/Tooltip';

class teampopup extends React.Component {
    constructor(props) {
        super(props);
        this.saveTeam = this.saveTeam.bind(this);
        this.addPerson = this.addPerson.bind(this);
        this.renderTeamChange = this.renderTeamChange.bind(this);
        this.personChanged = this.personChanged.bind(this);
        this.removePerson = this.removePerson.bind(this);
        this.valueChanged = this.valueChanged.bind(this);
        this.changeState = this.changeState.bind(this);
        this.idChanged = this.idChanged.bind(this);

        var allStudents = [];

        function isEmpty(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }

            return JSON.stringify(obj) === JSON.stringify({});
        }

        if (this.props.teamData && !isEmpty(this.props.teamData)) {
            if (this.props.teamData.allStudents) {
                //make sure there are people on this team
                for (var key of Object.keys(this.props.teamData.allStudents)) {
                    allStudents.push(this.props.teamData.allStudents[key]);
                }
            }
        }

        this.state = {
            teamName: this.props.teamName,
            allStudents: allStudents,
            totalGuesses: this.props.teamData.totalGuesses || 0,
            errorMessage: '',
        };
    }

    saveTeam() {
        if (this.props.new) {
            var teamName = this.state.teamName;

            if (this.state.teamName == '') {
                swal('Please enter a valid team name.', '', 'error');
                return;
            }

            teamName = teamName.replace(/\s*$/, '');

            //create a new team
            adminGameRequest(
                'teams/create',
                'POST',
                this.props.gameID,
                {
                    name: teamName,
                    allStudents: this.state.allStudents,
                },
                (d) => {
                    if (d.success) {
                        this.props.hideModal();
                        this.props.refreshTeams();
                    } else {
                        this.state['errorMessage'] = d.message;
                        this.setState(this.state);
                    }
                },
            );
        } else {
            adminGameRequest(
                'teams/update',
                'POST',
                this.props.gameID,
                {
                    name: this.state.teamName,
                    allStudents: this.state.allStudents,
                    totalGuesses: this.state.totalGuesses,
                },
                (d) => {
                    if (d.success) {
                        this.props.hideModal();
                        this.props.refreshTeams();
                    } else {
                        this.state['errorMessage'] = d.message;
                        this.setState(this.state);
                    }
                },
            );
        }
    }

    addPerson() {
        var allStudents = this.state['allStudents'];

        allStudents.push({
            name: '',
            id: '',
        });

        this.state['allStudents'] = allStudents;

        this.setState(this.state);
    }

    removePerson(position) {
        var allStudents = this.state['allStudents'];

        allStudents.splice(position, 1);

        this.state['allStudents'] = allStudents;

        this.setState(this.state);
    }

    valueChanged(e) {
        this.changeState(e.target.name, e.target.value);
    }

    changeState(key, value) {
        this.state[key] = value;
        this.setState(this.state);
    }

    renderTeamChange() {
        if (this.props.new) {
            return <button onClick={this.handleEdit}>Edit</button>;
        } else {
            return <button onClick={this.handleSave}>Save</button>;
        }
    }

    personChanged(e) {
        var allStudents = this.state['allStudents'];

        var position = parseInt(e.target.name);

        allStudents[position]['name'] = e.target.value;

        this.state['allStudents'] = allStudents;

        this.setState(this.state);
    }

    idChanged(e) {
        var allStudents = this.state['allStudents'];

        var position = parseInt(e.target.name);

        allStudents[position]['id'] = e.target.value;

        this.state['allStudents'] = allStudents;

        this.setState(this.state);
    }

    render() {
        var head = null;
        var teamChange = null;
        var br = null;
        var guesses = null;

        if (this.props.new) {
            head = (
                <h2
                    style={{
                        textAlign: 'center',
                        fontSize: '30px',
                        fontWeight: 'bold',
                    }}
                >
                    Add Team
                </h2>
            );
            teamChange = (
                <TextField
                    id="outlined-basic"
                    label="Team Name"
                    name="teamName"
                    onChange={this.valueChanged}
                    variant="outlined"
                    value={this.state.teamName}
                ></TextField>
            );

            br = <br></br>;
        } else {
            head = (
                <h2
                    style={{
                        textAlign: 'center',
                        fontSize: '30px',
                        fontWeight: 'bold',
                    }}
                >
                    {this.props.teamName}
                </h2>
            );
            guesses = (
                <Tooltip
                    title="This is the number of times this team has answered a question (incorrectly or correctly)."
                    arrow
                    placement="bottom"
                >
                    <TextField
                        id="outlined-basic"
                        type="number"
                        label="Total Guesses"
                        name="totalGuesses"
                        onChange={this.valueChanged}
                        variant="outlined"
                        value={parseInt(this.state.totalGuesses)}
                    ></TextField>
                </Tooltip>
            );
        }

        var errorMessage = null;

        if (this.state.errorMessage != '') {
            let errorStyle = {
                color: 'red',
                fontSize: '15px',
            };
            errorMessage = <p style={errorStyle}>{this.state.errorMessage}</p>;
        }

        return (
            <Modal centered show={true} onHide={() => this.props.hideModal()}>
                <Modal.Header closeButton>
                    {head}
                    <Button
                        style={{
                            marginBottom: '5px',
                            backgroundColor: 'transparent',
                            borderColor: 'transparent',
                            fontWeight: 'lighter',
                            color: '#118AB2',
                            fontSize: '50px',
                            paddingTop: '0px',
                            lineHeight: '35px',
                        }}
                        onClick={this.addPerson}
                    >
                        {' '}
                        +{' '}
                    </Button>
                </Modal.Header>

                <Modal.Body>
                    {teamChange}
                    {guesses}
                    <br /> <br />
                    <Divider style={{ marginBottom: '10px' }}></Divider>
                    {this.state['allStudents'].map((listitem, index) => (
                        <div key={index}>
                            <TextField
                                id="outlined-basic"
                                label="Student Name"
                                name={String(index)}
                                onChange={this.personChanged}
                                variant="outlined"
                                value={listitem['name']}
                                style={{ marginBottom: '6px' }}
                            ></TextField>

                            <Tooltip
                                title="The ID is an extra layer of security. You can enter anything that the student knows, like their school ID number. You can also leave it blank."
                                arrow
                                placement="bottom"
                            >
                                <TextField
                                    id="outlined-basic"
                                    label="Student ID"
                                    name={String(index)}
                                    onChange={this.idChanged}
                                    variant="outlined"
                                    value={listitem['id']}
                                    style={{
                                        marginBottom: '6px',
                                        width: '200px',
                                    }}
                                ></TextField>
                            </Tooltip>
                            <MDBCloseIcon
                                onClick={() => this.removePerson(index)}
                            />

                            <br />
                        </div>
                    ))}
                </Modal.Body>

                <Modal.Footer>
                    <button className="blue-btn" onClick={this.saveTeam}>
                        Save
                    </button>
                    <br></br>
                    {errorMessage}
                </Modal.Footer>
            </Modal>
        );
    }
}

export default withRouter(teampopup);
