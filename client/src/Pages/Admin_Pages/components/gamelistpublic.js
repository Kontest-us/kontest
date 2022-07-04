import React from 'react';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { adminRequest } from '../../Request';
import SingleGame from '../components/singlegame';
import { TextField } from '@material-ui/core';
import swal from 'sweetalert';
import { Redirect, Link } from 'react-router-dom';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ReactLoading from 'react-loading';

import firebase from 'firebase/app';
import 'firebase/auth';

class PublicGamelist extends React.Component {
    constructor(props) {
        super(props);
        this.logOut = this.logOut.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
        this.getGames = this.getGames.bind(this);
        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.redirect = this.redirect.bind(this);

        this.state = {
            redirect: false,
            windowWidth: window.innerWidth,
            state: 1, //0  settings, 1 is questions and 2 is teams
            username: firebase.auth().currentUser.displayName,
            games: [],
            newGameID: '',
            search: '',
            waiting: true,
            sort: 'None',
            lastGameCode: '',
            outOfGames: false,
        };
    }

    /**
     * will run after the first render() lifecycle
     */
    componentDidMount() {
        this.getGames();
    }

    /**
     * calls backend for all games. If there is an error
     */

    getGames() {
        adminRequest(
            'game/getAllPublicGames',
            'POST',
            { lastGameCode: this.state.lastGameCode },
            (d) => {
                if (d.success) {
                    let curr = this.state;

                    let currGames = curr['games'];

                    //Adds new games to the current games saved in state
                    for (let i = 0; i < d.games.length; i++) {
                        currGames.push(d.games[i]);
                    }

                    curr['games'] = currGames;

                    if (currGames['lastGameCode'] === d.lastGameCode) {
                        curr['outOfGames'] = true;
                    } else {
                        curr['lastGameCode'] = d.lastGameCode;
                    }

                    curr['waiting'] = false;
                    this.setState(curr);
                } else {
                    swal(d.message, '', 'error');
                    this.updateState('redirect', true);
                }
            },
        );
    }

    /**
     * used for interactive components
     * @param e
     */
    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    /**
     * updates single state
     * @param key
     * @param val
     */
    updateState(key, val) {
        let curr = this.state;
        curr[key] = val;
        this.setState(curr);
    }

    /**
     * redirects to login page if not logged in
     */
    redirect() {
        this.setState({
            redirect: true,
            windowWidth: this.state.windowWidth,
        });
    }

    // logout method, reroutes to home page through app.js
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

    deleteAccount() {
        if (
            window.confirm(
                'Are you sure you want to delete your account? This will also delete all games that you have created.',
            )
        ) {
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
                            //now will be automatically re-routed in app.js
                        })
                        .catch((error) => {
                            swal('Error deleting account!', error, 'error');

                            //now will be automatically re-routed in app.js
                        });
                } else {
                    swal(
                        'Error deleting account! Please refresh the page and try again!',
                        '',
                        'error',
                    );
                }
            });
        }
    }

    render() {
        // the following code is for searching the games
        // https://medium.com/@reneecruz/search-bar-in-react-js-in-six-simple-steps-4849118b2134
        let filteredGames = this.state.games.filter((game) => {
            return game.gameName
                .toLowerCase()
                .includes(this.state.search.toLowerCase());
        });

        //We will do filtering/sorting based on two values, the name of the game and type of the game. Games with type 1 are estimation
        //and games with type 2 are review.

        let chosenSort = this.state.sort;

        if (chosenSort === 'A-Z') {
            filteredGames.sort(function (a, b) {
                return a.gameName.toLowerCase() >= b.gameName.toLowerCase()
                    ? 1
                    : -1;
            });
        } else if (chosenSort === 'Z-A') {
            filteredGames.sort(function (a, b) {
                return a.gameName.toLowerCase() <= b.gameName.toLowerCase()
                    ? 1
                    : -1;
            });
        } else if (chosenSort === 'Estimation') {
            filteredGames = filteredGames.filter((game) => {
                return game.gameType === '1';
            });
        } else if (chosenSort === 'Review') {
            filteredGames = filteredGames.filter((game) => {
                return game.gameType === '2';
            });
        }

        if (this.state.redirect) {
            return <Redirect push to="/" />;
        }

        let listStyle = {
            height: (window.innerHeight * 3) / 5,
        };

        var games = [];
        var c = 1;

        for (var key of Object.keys(filteredGames)) {
            games.push(
                <SingleGame
                    isLimited={true}
                    key={c}
                    id={key}
                    number={c}
                    data={filteredGames[key]}
                ></SingleGame>,
            );
            c += 1;
        }

        return (
            <div>
                <br />
                <div className="pageDiv">
                    <br />
                    <br />
                    <br />
                    <div>
                        <h1 className="pageHeader">Public Games</h1>
                        <br />
                        <i>Feel free to use games created by other teachers.</i>
                        <br />
                        <br />
                        <br />

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                width: window.innerWidth - 320,
                            }}
                        >
                            <TextField
                                id="outlined-static"
                                label="Search"
                                rows={4}
                                defaultValue={this.state.search}
                                variant="filled"
                                name="search"
                                onChange={this.valueChanged}
                                style={{ width: '65%' }}
                            >
                                {' '}
                            </TextField>

                            <FormControl
                                variant="filled"
                                style={{ marginLeft: '25px', width: '10%' }}
                            >
                                <InputLabel id="demo-simple-select-outlined-label">
                                    Sort Games
                                </InputLabel>
                                <Select
                                    name="sort"
                                    labelId="demo-simple-select-outlined-label"
                                    id="demo-simple-select-outlined"
                                    value={this.state.sort}
                                    onChange={this.valueChanged}
                                    label="Sort Games"
                                >
                                    <MenuItem value={'None'}>None</MenuItem>
                                    <MenuItem value={'A-Z'}>A-Z</MenuItem>
                                    <MenuItem value={'Z-A'}>Z-A</MenuItem>
                                    <MenuItem value={'Estimation'}>
                                        Estimation
                                    </MenuItem>
                                    <MenuItem value={'Review'}>Review</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>

                    {this.state.waiting ? (
                        <div>
                            <ReactLoading
                                className="loading"
                                type={'spin'}
                                color={'#184c5d'}
                                height="200px"
                                width="200px"
                            />
                        </div>
                    ) : null}

                    {games.length === 0 && !this.state.waiting ? (
                        <div style={listStyle}>
                            <br></br>

                            <h3
                                style={{
                                    color: '#073b4c',
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                }}
                            >
                                No Games Found!
                            </h3>
                        </div>
                    ) : (
                        <div style={listStyle}>
                            <br />
                            {games}
                            <br />
                            <br />
                            {!this.state.outOfGames ? (
                                <button
                                    className="dark-green-btn"
                                    style={{ width: '200px' }}
                                    onClick={this.getGames}
                                >
                                    Load More
                                </button>
                            ) : (
                                <h3
                                    style={{
                                        color: '#073b4c',
                                        fontWeight: 'bold',
                                        fontSize: '20px',
                                    }}
                                >
                                    No More Games!
                                </h3>
                            )}
                            <br />
                            <br />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default PublicGamelist;
