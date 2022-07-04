import React from 'react';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import QuestionPopup from '../modals/questionpopup';
// import MathPopup from '../modals/mathhelppopup'
import QuestionRow from './singlequestion';
import Divider from '@material-ui/core/Divider';
import { adminGameRequest } from '../../Request';
import { TextField } from '@material-ui/core';
import SamplePopup from '../modals/samplepopup';
import swal from 'sweetalert';
import firebase from 'firebase/app';
import 'firebase/storage';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';

class questionanswer extends React.Component {
    constructor(props) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.showModal = this.showModal.bind(this);
        this.clearQuestions = this.clearQuestions.bind(this);
        this.showModal1 = this.showModal1.bind(this);
        this.hideModal1 = this.hideModal1.bind(this);
        this.getQuestions = this.getQuestions.bind(this);
        this.loadImage = this.loadImage.bind(this);

        this.state = {
            data: {}, //all of the questions
            imageURLS: {},
            questionModal: false, // question pop up
            q: '', //selected question
            a: '', //selected answer
            choices: [], //selected choices
            multiplier: 0, //selected multipler
            type: '', //selected type
            qId: '', //selected id
            qNum: 0, //selected question numbere
            image: '', // selected image
            windowWidth: window.innerWidth,
            search: '',
            gameType: '', //the game type
            imageCode: '', // selected image code to be sent to popup,
            sort: 'All',
        };
    }
    /**
     * will run after the first render() lifecycle
     */
    componentDidMount() {
        this.getQuestions();

        setTimeout(() => {
            this.state['notification'] = '';
            this.setState(this.state);
        }, 10000);
    }

    /**
     * gets questions from backend
     */
    getQuestions() {
        adminGameRequest('questions/get', 'GET', this.props.gameID, {}, (d) => {
            if (d.success) {
                this.state['data'] = d.data;
                this.state['gameType'] = d.type;

                this.setState(this.state);
            } else {
                console.log(d.message);
                swal(d.message, '', 'error');
                this.props.redirect();
            }
        });
    }

    // not used currently,
    loadImage(imageCode) {
        var returnedURL = '';

        // if there is an image
        if (imageCode.length > 0) {
            // Create a reference to the file we want to download
            var imageRef = firebase
                .storage()
                .ref()
                .child('questions/' + this.props.gameID + '/' + imageCode);

            // Get the download URL
            imageRef
                .getDownloadURL()
                .then((url) => {
                    // set the url to imageURL state variable
                    returnedURL = url;
                    alert(returnedURL);
                    return returnedURL;
                })
                .catch((error) => {
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    switch (error.code) {
                        case 'storage/object-not-found':
                            // File doesn't exist
                            break;
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;
                        case 'storage/canceled':
                            // User canceled the upload
                            break;

                        // ...

                        case 'storage/unknown':
                            // Unknown error occurred, inspect the server response
                            break;
                    }
                });
        } else {
            return returnedURL;
        }
    }

    onSubmit = (event) => {
        const { value } = this.state;
        event.preventDefault();
    };

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    hideModal() {
        this.state['questionModal'] = false;
        this.setState(this.state);
    }

    showModal(data, number, id, imageURL) {
        let curr = this.state;

        curr['questionModal'] = true;
        curr['q'] = data.q;
        curr['a'] = data.a;
        curr['type'] = data.t;
        curr['multiplier'] = data.multiplier ?? 1;
        curr['choices'] = data.choices ?? [];
        curr['qId'] = id;
        curr['qNum'] = number;
        curr['image'] = imageURL;
        curr['imageCode'] = data.image;

        this.setState(curr);
    }

    showModal1() {
        this.state['sampleModal'] = true;
        this.setState(this.state);
    }

    hideModal1() {
        this.state['sampleModal'] = false;
        this.setState(this.state);
    }

    clearQuestions() {
        swal({
            title: 'Are you sure?',
            text: 'If you continue, all questions and team scores will be deleted. This operation is undoable.',

            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willClear) => {
            if (willClear) {
                adminGameRequest(
                    'questions/clear',
                    'DELETE',
                    this.props.gameID,
                    {},
                    (d) => {
                        if (d.success) {
                            this.getQuestions();
                        } else {
                            swal(
                                'Error! Please refresh the page and try again!',
                                '',
                                'error',
                            );
                        }
                    },
                );
            } else {
                return;
            }
        });
    }

    render() {
        let expandScreenIcon = null;

        if (this.props.isFullScreen) {
            expandScreenIcon = (
                <AiOutlineFullscreenExit
                    onClick={this.props.changeFullScreen}
                    className="full-screen-icon"
                ></AiOutlineFullscreenExit>
            );
        } else {
            expandScreenIcon = (
                <AiOutlineFullscreen
                    onClick={this.props.changeFullScreen}
                    className="full-screen-icon"
                ></AiOutlineFullscreen>
            );
        }

        var questions = [];

        var c = 1;

        //search component below - if the team name matches search value, then we add it to teams array for rendering on the screen

        for (var key of Object.keys(this.state.data)) {
            if (
                this.state.data[key]['q']
                    .toLowerCase()
                    .includes(this.state.search.toLowerCase())
            ) {
                questions.push(
                    <QuestionRow
                        isLimited={this.props.isLimited}
                        key={c}
                        id={key}
                        number={Object.keys(this.state.data).indexOf(key) + 1}
                        data={this.state.data[key]}
                        gameID={this.props.gameID}
                        openPopup={this.showModal}
                        refreshQuestions={this.getQuestions}
                        imageURL={this.state.imageURLS[0]}
                    ></QuestionRow>,
                );
                c += 1;
            }
        }

        //question modal

        var questionModal = null;

        if (this.state.questionModal) {
            questionModal = (
                <QuestionPopup
                    isLimited={this.props.isLimited}
                    imageCode={this.state.imageCode}
                    image={this.state.image}
                    gameType={this.state.gameType}
                    num={this.state.qNum}
                    id={this.state.qId}
                    gameID={this.props.gameID}
                    question={this.state.q}
                    answer={this.state.a}
                    choices={this.state.choices}
                    type={this.state.type}
                    multiplier={this.state.multiplier}
                    hideModal={this.hideModal}
                    refreshQuestions={this.getQuestions}
                    gameID={this.props.gameID}
                />
            );
        }

        // sample modal
        var sampleModal = null;

        if (this.state.sampleModal) {
            sampleModal = <SamplePopup hideModal={this.hideModal1} />;
        }

        return (
            <Card className="pageDiv">
                <Card.Body>
                    <br />
                    <br />
                    <br />
                    <h1 className="pageHeader">Questions</h1>{' '}
                    <h1 className="titleStyle1" style={{ fontWeight: 'bold' }}>
                        {c - 1}
                    </h1>
                    <br />
                    <Divider></Divider>
                    <br />
                    <div>
                        {!this.props.isLimited ? (
                            <>
                                <button
                                    className="red-btn"
                                    style={{
                                        width: '200px',
                                        marginRight: '5px',
                                    }}
                                    onClick={this.clearQuestions}
                                >
                                    Clear Questions
                                </button>
                                <button
                                    className="dark-green-btn"
                                    style={{
                                        width: '200px',
                                        marginLeft: '5px',
                                    }}
                                    onClick={() =>
                                        this.showModal(
                                            {
                                                q: '',
                                                a: '',
                                                multiplier: 1,
                                                type: '',
                                                choices: [],
                                            },
                                            0,
                                            '',
                                        )
                                    }
                                >
                                    Add Question
                                </button>
                                <br />
                                <br />
                            </>
                        ) : null}

                        {this.state.gameType === '1' ? (
                            <a
                                style={{ color: '#118AB2' }}
                                href="https://docs.google.com/document/d/16oAn9ZXG7ZMnzGOz1NFbSub17HpDvttPwoQeY8LJj5Q/edit?usp=sharing"
                                target="_blank"
                            >
                                <button className="trans-blue-btn">
                                    Sample Estimation Questions
                                </button>
                            </a>
                        ) : null}
                    </div>
                    <br />
                    <div
                        style={{
                            display: 'flex',
                            margin: 'auto',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            width: '100%',
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
                            style={{ width: '90%' }}
                        >
                            {' '}
                        </TextField>
                    </div>
                    {questions}
                    <br />
                    <br />
                    <br />
                    {expandScreenIcon}
                </Card.Body>

                {questionModal}
                {sampleModal}
            </Card>
        );
    }
}

export default questionanswer;
