import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';

import Particle from '../../Particle.tsx';

export default function StudentName(props) {
    return (
        <div className={'App'}>
            <Particle />
            {props.errorBox}

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
                        name="studentName"
                        value={props.studentName}
                        placeholder="What is your name?"
                        onChange={props.valueChanged}
                    />
                </div>

                <div className="form-group">
                    <button
                        className="light-green-btn"
                        style={{ width: '400px' }}
                        onClick={props.checkStudent}
                    >
                        Continue
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
