import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import '../../style/index.css';
import '../../style/buttons.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import { adminGameRequest, adminRequest } from '../Request';
import { Redirect, Link } from 'react-router-dom';
import Gamelist from './components/gamelist';
import PublicGamelist from './components/gamelistpublic';

import Account from './components/account';
import { DashboardLayoutAdmin } from './components/LayoutAdmin';
import swal from 'sweetalert';
import DeleteModal from './modals/deletepopup';

var MIN_SCREEN = 700;

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.logOut = this.logOut.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
        this.changeState = this.changeState.bind(this);
        this.changeLive = this.changeLive.bind(this);
        this.getGames = this.getGames.bind(this);
        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.reauthenticate = this.reauthenticate.bind(this);

        this.showModal = this.showModal.bind(this);

        this.hideModal = this.hideModal.bind(this);
        this.redirect = this.redirect.bind(this);

        this.state = {
            redirect: false,
            windowWidth: window.innerWidth,
            page: 1, // 1: All Games , 2: Account, 3: Public Games
            username: firebase.auth().currentUser.displayName,
            games: [],
            newGameID: '',
            search: '',
            sortedGames: [],
            deletedModal: false,
            sampleModal: false,
        };
        this.getGames();
    }

    componentDidMount() {
        if (window.innerWidth <= MIN_SCREEN) {
            swal(
                'Warning: your screen is a bit too small. As a result, some of our features may be off your screen or not properly work. We recommend that you try this on a computer or tablet.',
                '',
                'warning',
            );
        }
    }

    showModal() {
        this.state['sampleModal'] = true;
        this.setState(this.state);
    }

    hideModal() {
        this.state['sampleModal'] = false;
        this.setState(this.state);
    }

    getGames() {
        adminRequest('game/getAllGames', 'GET', {}, (d) => {
            if (d.success) {
                this.state['games'] = d.games;
                this.state['sortedGames'] = d.games;
                this.setState(this.state);
            } else {
                swal('Error!', '', 'error');
            }
        });
    }

    changeState(number) {
        this.updateState('page', number);
    }

    changeLive(index) {
        this.state['games'][index]['live'] =
            !this.state['games'][index]['live'];

        var data = { live: this.state.games[index]['live'] };

        adminGameRequest(
            'game/makeGameLive',
            'POST',
            this.state.games[index]['gameCode'],
            data,
            (d) => {
                if (d.success) {
                    var liveString = 'Not Live';
                    if (this.state.games[index]['live']) {
                        liveString = 'Live';
                    }
                    swal(
                        'Updated ' +
                            this.state.games[index]['gameName'] +
                            ' to ' +
                            liveString +
                            '.',
                        '',
                        'success',
                    );
                } else {
                    swal(d.message, '', 'error');
                }
            },
        );

        // call backend method for changing live/dead

        this.setState(this.state);
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    redirect() {
        this.setState({
            redirect: true,
            windowWidth: this.state.windowWidth,
        });
    }

    logOut() {
        firebase
            .auth()
            .signOut()
            .then(() => {
                // Sign-out successful.
                localStorage.clear();
                sessionStorage.clear();
                //now will be automatically re-routed in app.js
            })
            .catch((error) => {
                swal('Error logging out!', error, 'error');

                //now will be automatically re-routed in app.js
            });
    }

    //reauthenticates a user when they want to delete their account
    reauthenticate = (currentPassword) => {
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword,
        );
        return user.reauthenticateWithCredential(cred);
    };

    deleteAccount() {
        //This operation is sensitive and requires recent authentication. The user must enter their password again.

        swal({
            title: 'Are you sure?',
            text: 'Are you sure you want to delete your account? This will also delete all games that you have created.',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                this.state['deletedModal'] = true;
                this.setState(this.state);
            } else {
            }
        });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push to="/admin/login" />;
        }

        var theBody = null;
        if (this.state.page === 1) {
            theBody = <Gamelist />;
        } else if (this.state.page === 2) {
            theBody = <Account deleteAccount={this.deleteAccount} />;
        } else if (this.state.page === 3) {
            theBody = <PublicGamelist />;
        }

        return (
            <DashboardLayoutAdmin
                home={true}
                account={() => this.changeState(2)}
                publicGames={() => this.changeState(3)}
                games={() => this.changeState(1)}
                logout={this.logOut}
            >
                <div className="AppAdmin">
                    <div>
                        <Navbar fixed="top" variant="dark" className="nav-bar">
                            <h5 className="nav-header-game"> Kontest </h5>
                            <Nav className="mr-auto"></Nav>

                            <Form inline>
                                <Link to="/">
                                    <button
                                        className="red-btn"
                                        style={{ width: '100px' }}
                                    >
                                        Home
                                    </button>
                                </Link>
                            </Form>
                        </Navbar>
                    </div>
                    <div>{theBody}</div>

                    {this.state.deletedModal ? (
                        <DeleteModal
                            hideModal={() =>
                                this.updateState('deletedModal', false)
                            }
                        ></DeleteModal>
                    ) : null}
                </div>
            </DashboardLayoutAdmin>
        );
    }
}

export default Dashboard;
