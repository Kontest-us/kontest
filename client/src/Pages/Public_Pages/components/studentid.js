import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import Particle from '../../Particle.tsx';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import swal from 'sweetalert';

export default function StudentName(props) {
    function help() {
        swal(
            'The ID is to prevent other players from playing as you. You can enter anything that is easy to remember, like your school ID number. You can also leave it blank.',
            '',
            'info',
        );
    }

    return (
        <div className={'App'}>
            <Particle />
            {props.errorBox}

            <Navbar fixed="top" variant="dark" className="nav-bar transparent">
                <Nav className="mr-auto"></Nav>
                <AiOutlineQuestionCircle
                    onClick={help}
                    color="white"
                    size="65px"
                    style={{ margin: '2px' }}
                />
            </Navbar>

            <div className="inner-div">
                <h3 className="titleStyle">{props.gameName}</h3>
                <br />

                <div className="form-group">
                    <input
                        type="text"
                        style={{
                            textAlign: 'center',
                            width: '400px',
                            height: '50px',
                            fontSize: '20px',
                        }}
                        name="id"
                        value={props.id}
                        placeholder="Please enter an ID for security"
                        onChange={props.valueChanged}
                    />
                </div>

                <div className="form-group">
                    <button
                        className="light-green-btn"
                        style={{ width: '400px' }}
                        onClick={props.getStudentTeam}
                    >
                        Continue
                    </button>
                </div>

                <div className="form-group">
                    <button
                        className="blue-btn"
                        style={{ width: '400px' }}
                        onClick={help}
                    >
                        What is this?
                    </button>
                </div>

                <div className="form-group">
                    <button
                        className="red-btn"
                        style={{ width: '400px' }}
                        onClick={props.goBack}
                    >
                        Back
                    </button>
                </div>
            </div>

            <br></br>
        </div>
    );
}
