import React from 'react';
import Modal from 'react-bootstrap/Modal';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { withRouter } from 'react-router-dom';

class helppopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        let bgStyle = {
            backgroundColor: '#f5f7fa',
            borderRadius: '10px',
            padding: '1em',
            margin: '2px',
        };

        return (
            <Modal
                show={true}
                backdrop="static"
                keyboard={false}
                dialogClassName="sideModal"
            >
                <Modal.Body style={{ align: 'center' }}>
                    <div style={bgStyle} style={{ align: 'center' }}>
                        <label style={{ fontWeight: 'bold' }}>
                            Question Type:{' '}
                        </label>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

export default withRouter(helppopup);
