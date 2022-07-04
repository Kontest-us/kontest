import React from 'react';
import Modal from 'react-bootstrap/Modal';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { withRouter } from 'react-router-dom';

import Divider from '@material-ui/core/Divider';

class samplepopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: [
                'The number of items checked out at the Schaumburg Library from 2016 to 2017.',
                'The number of words in the complete Harry Potter series.',
                'The approximate amount of grams of protein in a caterpillar.',
                'The number of asteroids in the asteroid belt with a diameter larger than 1 km.',
                'The shortest distance from Buenos Aires to Beijing, in feet.',
                'The mass of a Lamborghini Aventador, in pounds.',
            ],
        };
    }

    render() {
        let bgStyle = {
            backgroundColor: '#f5f7fa',
            borderRadius: '10px',
            padding: '1em',
            margin: '2px',
        };

        var body = [];

        for (var key in this.state.text) {
            body.push(
                <div>
                    <p style={{ textAlign: 'center' }}>
                        {this.state.text[key]}
                    </p>

                    <Divider></Divider>
                    <br />
                </div>,
            );
        }

        return (
            <Modal show={true} onHide={() => this.props.hideModal()}>
                <Modal.Header closeButton>
                    <h4 style={{ fontWeight: 'bold', fontSize: '25px' }}>
                        Sample Estimation Questions
                    </h4>
                </Modal.Header>

                <Modal.Body style={{ align: 'center' }}>
                    <div style={bgStyle} style={{ align: 'center' }}>
                        {body}
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

export default withRouter(samplepopup);
