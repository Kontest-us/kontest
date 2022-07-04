import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import Button from 'react-bootstrap/Button';
import { MDBCloseIcon } from 'mdbreact';
import { adminGameRequest } from '../../Request';
import swal from 'sweetalert';
import Divider from '@material-ui/core/Divider';

class singleteam extends React.Component {
    constructor(props) {
        super(props);
        this.deleteTeam = this.deleteTeam.bind(this);
        this.waiting = false;
    }

    /**
     * onclick of the MDBCloseButton, delete this team
     */
    deleteTeam() {
        if (this.waiting) {
            return;
        }

        this.waiting = true;

        adminGameRequest(
            'teams/delete',
            'DELETE',
            this.props.gameID,
            {
                name: this.props.teamName,
            },
            (d) => {
                if (d.success) {
                    this.props.refreshTeams();
                } else {
                    swal(d.message, '', 'error');
                }
            },
        );
    }

    render() {
        let bgStyle = {
            backgroundColor: '#f8fafd',

            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            marginTop: '10px',
            width: '250px',
            margin: '10px',
        };

        let buttonStyle = {
            align: 'left',
            marginRight: '10px',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            color: '#073b4c',
            fontWeight: 'bold',
            fontSize: '20px',
            padding: 0,
        };

        let textStyle = {
            color: '#093145',
            fontSize: '25px',
            marginBottom: '5px',
            fontWeight: 'bold',
            wordWrap: 'break-word',
        };
        var students = [];
        let key = 0;
        for (var student in this.props.teamData.allStudents) {
            students.push(
                <h1 key={key} className="sub-head">
                    {this.props.teamData.allStudents[student]['name']}
                </h1>,
            );
            key += 1;
        }

        console.log(this.props.teamName);

        return (
            <div>
                <div style={bgStyle}>
                    <div style={{ float: 'right' }}>
                        <MDBCloseIcon onClick={this.deleteTeam} />
                    </div>

                    <h1 style={textStyle}> {this.props.teamName}</h1>
                    <Divider></Divider>
                    <br />

                    {students}
                    <br />

                    <button
                        className="dark-green-btn small1"
                        style={{ width: '150px' }}
                        onClick={() =>
                            this.props.openPopup(
                                this.props.teamData,
                                this.props.teamName,
                                false,
                            )
                        }
                    >
                        Edit
                    </button>
                </div>
            </div>
        );
    }
}

export default singleteam;
