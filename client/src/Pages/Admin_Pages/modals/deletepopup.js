import React from 'react';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { adminRequest } from '../../Request';
import swal from 'sweetalert';
import firebase from 'firebase/app';
import 'firebase/auth';
import Modal from 'react-bootstrap/Modal';

class deletepopup extends React.Component {
    constructor(props) {
        super(props);

        this.deleteAccount = this.deleteAccount.bind(this);
        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);

        this.state = {
            password: '',
        };
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    deleteAccount() {
        //reauthenticates a user when they want to delete their account
        let reauthenticate = (currentPassword) => {
            var user = firebase.auth().currentUser;
            var cred = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword,
            );
            return user.reauthenticateWithCredential(cred);
        };

        let confirmPassword = this.state.password;

        reauthenticate(confirmPassword)
            .then(() => {
                var user = firebase.auth().currentUser;

                adminRequest('admin/deleteAccount', 'DELETE', {}, (d) => {
                    //success
                    if (d.success) {
                        user.delete()
                            .then(() => {
                                // User deleted.
                                localStorage.clear();
                                sessionStorage.clear();
                                swal(
                                    'Your account has been deleted.',
                                    '',
                                    'success',
                                );
                                this.props.hideModal();
                                //now will be automatically re-routed in app.js
                            })
                            .catch((error) => {
                                swal(
                                    'Error deleting account!',
                                    error.message,
                                    'error',
                                );
                                //now will be automatically re-routed in app.js
                                this.props.hideModal();
                            });
                    } else {
                        swal('Error deleting account!', d.message, 'error');
                    }
                });
            })
            .catch((error) => {
                swal('Error!', error.message, 'error');
            });
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
                onHide={() => this.props.hideModal()}
            >
                <Modal.Header closeButton>
                    <h1 style={{ fontWeight: 'bold', fontSize: '25px' }}>
                        Please enter your password
                    </h1>
                </Modal.Header>

                <Modal.Body style={{ align: 'center' }}>
                    <div style={bgStyle} style={{ align: 'center' }}>
                        <input
                            style={{ color: '#073b4c' }}
                            type="password"
                            className="form-control"
                            name="password"
                            value={this.state.password}
                            placeholder="Enter password"
                            onChange={this.valueChanged}
                        />
                        <br></br>
                        <button
                            className="red-btn"
                            onClick={this.deleteAccount}
                        >
                            Delete Account
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

export default deletepopup;
