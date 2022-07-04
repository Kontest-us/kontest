import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import '../../../style/extra.css';

import Divider from '@material-ui/core/Divider';
import { studentRequest } from '../../Request';
import swal from 'sweetalert';

class teams extends React.Component {
    constructor(props) {
        super(props);

        this.leaveTeam = this.leaveTeam.bind(this);
        this.onClickTeam = this.onClickTeam.bind(this);

        this.state = {};
    }

    componentDidMount() {}

    componentWillUnmount() {}

    onClickTeam() {
        if (this.props.studentFreedom !== 1) {
            if (this.props.actualTeamName === '') {
                var teamName = this.props.teamName.replace(/\s*$/, '');
                if (this.joinBtn) {
                    this.joinBtn.setAttribute('disabled', 'disabled');
                }

                studentRequest(
                    'students/update',
                    'POST',
                    this.props.gameCode,
                    {
                        studentName: this.props.studentName,
                        studentId: this.props.studentId,
                        newTeam: teamName,
                        isNew: false,
                    },
                    (d) => {
                        if (this.joinBtn) {
                            this.joinBtn.removeAttribute('disabled');
                        }

                        swal(d.message, '', 'info');
                        if (d.success) {
                            this.props.setTeamName(teamName);
                            localStorage.setItem('teamName', teamName);
                        } else {
                            alert(d.message);
                        }
                    },
                );
            }
        }
    }

    leaveTeam() {
        this.props.leaveTeam();
        this.props.setTeamName('');
    }

    render() {
        var students = [];

        let count = 0;

        for (var student in this.props.studentArray) {
            students.push(
                <h1 key={count} className="sub-head">
                    {this.props.studentArray[student]['name']}
                </h1>,
            );
            count += 1;
        }

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

        var bgStyle = null;

        if (this.props.showLeaveButton) {
            //give the glow effect

            bgStyle = {
                backgroundColor: 'white',

                borderColor: '#06d6a0',
                boxShadow: '-1px 1px 30px 14px #06d6a0',
                borderWidth: 2,
                borderRadius: '10px',
                padding: '1em',
                margin: '20px',
                width: '300px',
            };
        } else {
            bgStyle = {
                backgroundColor: 'white',

                borderColor: '#dfe3e6',
                boxShadow: '-1px 1px 30px 14px #ced2d5',
                borderWidth: 2,
                borderRadius: '10px',
                padding: '1em',
                margin: '20px',
                width: '300px',
            };
        }

        return (
            <div key={this.props.teamName}>
                <div style={bgStyle}>
                    <h1 key={this.props.teamName} style={textStyle}>
                        {this.props.teamName}
                    </h1>

                    <Divider></Divider>
                    <br />

                    {students}

                    <br />

                    {this.props.showLeaveButton ? (
                        <button className="red-btn" onClick={this.leaveTeam}>
                            Leave Team
                        </button>
                    ) : null}

                    {parseInt(this.props.studentFreedom) !== 1 &&
                    this.props.actualTeamName === '' &&
                    students.length < this.props.maxPerTeam ? (
                        <button
                            onClick={() => this.onClickTeam()}
                            ref={(joinBtn) => {
                                this.joinBtn = joinBtn;
                            }}
                            className="dark-green-btn"
                        >
                            {' '}
                            Join Team
                        </button>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default teams;
