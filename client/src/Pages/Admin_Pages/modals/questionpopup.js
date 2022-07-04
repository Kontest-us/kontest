import React from 'react';
import Modal from 'react-bootstrap/Modal';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { withRouter } from 'react-router-dom';
import { TextField } from '@material-ui/core';
import Button from 'react-bootstrap/Button';
import { adminGameRequest } from '../../Request';
import swal from 'sweetalert';
import Form from 'react-bootstrap/Form';
import { MDBCloseIcon } from 'mdbreact';
import MathComponent from '../../Math';
import MathField from '../../MathField';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import Tooltip from '@material-ui/core/Tooltip';

import { FileDrop } from 'react-file-drop';

class questionpopup extends React.Component {
    constructor(props) {
        super(props);
        this.saveQuestion = this.saveQuestion.bind(this);
        this.updateState = this.updateState.bind(this);
        this.valueChanged = this.valueChanged.bind(this);
        this.addAnswerChoice = this.addAnswerChoice.bind(this);
        this.removeAnswerChoice = this.removeAnswerChoice.bind(this);
        this.choiceChanged = this.choiceChanged.bind(this);
        this.goodAnswer = this.goodAnswer.bind(this);
        this.specialReplace = this.specialReplace.bind(this);
        this.formatMathText = this.formatMathText.bind(this);
        this.unformatMathText = this.unformatMathText.bind(this);
        this.addBrackets = this.addBrackets.bind(this);
        this.saveFile = this.saveFile.bind(this);
        this.saveImageStorage = this.saveImageStorage.bind(this);
        this.getRandomText = this.getRandomText.bind(this);
        this.loadFirebaseImage = this.loadFirebaseImage.bind(this);
        this.deleteImageFromFirebase = this.deleteImageFromFirebase.bind(this);
        this.removeImageFile = this.removeImageFile.bind(this);
        this.changeAnswerType = this.changeAnswerType.bind(this);

        //Reformats answer choices
        let choices = [];

        for (var i = 0; i < this.props.choices.length; i++) {
            choices.push({
                text: this.props.choices[i],
                correct: this.props.answer === this.props.choices[i],
            });
        }

        //Gives teacher option to input estimation answer as a * 10^b
        let isEstimathon = parseInt(this.props.gameType) === 1;

        let answerExp = '';
        let answerBase = '';
        let answerType = 1;
        let answer = this.props.answer;

        if (isEstimathon) {
            let eIndex = answer.indexOf('e');
            if (eIndex >= 0) {
                answerType = 2;
                answerBase = answer.substring(0, eIndex);
                answerExp = answer.substring(eIndex + 1, answer.length);
            }
        }

        this.state = {
            question: this.unformatMathText(this.props.question),
            answer: answer,
            answerExp: answerExp,
            answerBase: answerBase,
            answerType: answerType,
            type: this.props.type || (isEstimathon ? 'e' : ''),
            choices: choices, //altough this is stored
            multiplier: this.props.multiplier,
            imageFile: null,
            randomStr: '',
            deletedFirebaseImage: false,
            image: '',
        };

        this.loadFirebaseImage();
    }

    componentDidMount() {}

    changeAnswerType(type) {
        if (this.props.isLimited) {
            return;
        }

        //changes the bound type for estimathon questions
        this.state['answerType'] = parseInt(type);
        this.setState(this.state);
    }

    removeImageFile() {
        this.state.imageFile = null;
        if (this.props.image) {
            this.state.deletedFirebaseImage = true;
        }
        this.setState(this.state);
    }

    deleteImageFromFirebase(imageCode) {
        // Create a reference to the file to delete
        var imageRef = firebase
            .storage()
            .ref()
            .child('questions/' + this.props.gameID + '/' + imageCode);

        // Delete the file
        imageRef
            .delete()
            .then(() => {
                // File deleted successfully
            })
            .catch((error) => {
                console.log(error);
                // Uh-oh, an error occurred!
            });
    }

    loadFirebaseImage() {
        // if add question, then no prop passed in
        if (this.props.image) {
            if (this.props.image.length > 0) {
                // Create a reference to the file we want to download
                var imageRef = firebase
                    .storage()
                    .ref()
                    .child(
                        'questions/' +
                            this.props.gameID +
                            '/' +
                            this.props.imageCode,
                    );

                // Get the download URL
                imageRef
                    .getDownloadURL()
                    .then((url) => {
                        // set the url to imageURL state variable
                        // this.state.imageFile = url
                        this.state.image = url;
                        this.setState(this.state);
                    })
                    .catch((error) => {
                        // A full list of error codes is available at
                        // https://firebase.google.com/docs/storage/web/handle-errors
                        alert(error);
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
            }
        }
    }

    /**
     * probability of collision: 1/2800000000000
     * digits: 8
     * @param length
     * @returns {string}
     */
    getRandomText() {
        var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.match(/./g);

        var result = '';

        // checks if there was an image uploaded or not
        // probably not needed, but works with it
        if (this.state.imageFile) {
            for (var i = 0; i < 8; i++) {
                result += charset[Math.floor(Math.random() * charset.length)];
            }
        }

        return result;
    }

    saveImageStorage() {
        return new Promise((resolve) => {
            //asynchronous method

            if (this.state.imageFile !== null) {
                if (this.state.imageFile[0].type.includes('image')) {
                    firebase
                        .auth()
                        .currentUser.getIdToken(/* forceRefresh */ true)
                        .then((idToken) => {
                            // only upload file if user is authenticated

                            var uploadTask = firebase
                                .storage()
                                .ref()
                                .child(
                                    'questions/' +
                                        this.props.gameID +
                                        '/' +
                                        this.state.randomStr,
                                )
                                .put(this.state.imageFile[0]);

                            // Register three observers:
                            // 1. 'state_changed' observer, called any time the state changes
                            // 2. Error observer, called on failure
                            // 3. Completion observer, called on successful completion
                            uploadTask.on(
                                'state_changed',
                                (snapshot) => {
                                    // Observe state change events such as progress, pause, and resume
                                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                    var progress =
                                        (snapshot.bytesTransferred /
                                            snapshot.totalBytes) *
                                        100;
                                    switch (snapshot.state) {
                                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                                            break;
                                        case firebase.storage.TaskState.RUNNING: // or 'running'
                                            break;
                                    }
                                },
                                (error) => {
                                    // Handle unsuccessful uploads
                                    alert(
                                        'Your upload was unsuccessful. Please make sure you have the correct file.',
                                    );
                                },
                                () => {
                                    // Handle successful uploads on complete
                                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                                    resolve(true);
                                },
                            );

                            // add await - !!!!
                        })
                        .catch((error) => {
                            console.log('Auth Error');
                            resolve(false);
                        });
                } else {
                    resolve(false);
                }
            } else {
                resolve(true);
            }
        });
    }

    async saveQuestion() {
        var randomStr = this.getRandomText();

        // update random string to later send in questions
        this.state.randomStr = randomStr;
        this.setState(this.state);

        var question = this.state.question;
        var answer = this.state.answer;
        var type = this.state.type;
        var choices = this.state.choices;
        var multiplier = this.state.multiplier;
        var image = this.state.randomStr;
        var answerType = parseInt(this.state.answerType);

        //Format a * 10^b to aeb, where e = 10 ^
        if (type === 'e' && answerType === 2) {
            answer = this.state.answerBase + 'e' + this.state.answerExp;
        }

        if (type === 'e' || type === 's') {
            answer = answer.replace(/,/g, ''); //removes commas

            if (isNaN(answer) && type === 'e') {
                swal('The answer you submitted is not a number!', '', 'error');
                return;
            }
        }

        //clean up choices so that it gets rid of empty strings

        var i = 0;
        var parsedChoices = [];
        while (i < choices.length) {
            if (choices[i]['text'] != '') {
                parsedChoices.push(choices[i]['text']);
                if (choices[i]['correct']) {
                    answer = choices[i]['text'];
                }
            }
            i++;
        }

        //if question or answer is "", then return

        if (question === '') {
            swal('Please enter a question!', '', 'error');
            return;
        } else if (answer === '') {
            swal('Please enter an answer!', '', 'error');
            return;
        } else if (type === 'm' && parsedChoices.length <= 1) {
            swal('Please enter more than 1 answer choice!', '', 'error');
            return;
        } else if (type != 'e' && multiplier === '') {
            swal('Please enter a number of points!', '', 'error');
            return;
        }

        // which imageCode to save in questions LOGIC
        var saveImage = await this.saveImageStorage();

        //delete firebase image if need to
        if (this.state.deletedFirebaseImage) {
            // checking if user wants to delete firebase image or nah
            this.deleteImageFromFirebase(this.props.imageCode);
            if (this.state.imageFile === null) {
                // since no firebase and image file, imageCode will be ""
                image = '';
            }
        } else {
            if (this.props.imageCode) {
                image = this.props.imageCode;
            } else if (this.state.imageFile === null) {
                image = '';
            }
        }

        if (saveImage || this.state.imageFile === null) {
            // saves image in firebase and returns true

            //disable modal

            if (this.modalComp) {
                this.modalComp.setAttribute('disabled', 'disabled');
            }

            if (this.props.id === '') {
                //new question

                adminGameRequest(
                    'questions/create',
                    'POST',
                    this.props.gameID,
                    {
                        question: this.formatMathText(question),
                        answer: String(answer),
                        choices: parsedChoices,
                        type: type,
                        multiplier: parseFloat(multiplier),
                        image: image,
                    },
                    (d) => {
                        if (d.success) {
                            //enable modal
                            if (this.modalComp) {
                                this.modalComp.removeAttribute('disabled');
                            }

                            this.props.hideModal();
                            this.props.refreshQuestions();
                        } else {
                            swal(d.message, '', 'error');
                        }
                    },
                );
            } else {
                adminGameRequest(
                    'questions/update',
                    'POST',
                    this.props.gameID,
                    {
                        id: this.props.id,
                        question: this.formatMathText(question),
                        answer: String(answer),
                        choices: parsedChoices,
                        type: type,
                        multiplier: parseFloat(multiplier),
                        image: image,
                    },
                    (d) => {
                        if (d.success) {
                            this.props.hideModal();
                            this.props.refreshQuestions();
                        } else {
                            swal(d.message, '', 'error');

                            //enable modal
                            if (this.modalComp) {
                                this.modalComp.removeAttribute('disabled');
                            }
                        }
                    },
                );
            }
        } else {
            swal('Please enter an image file.', '', 'error');
        }
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    specialReplace(text, s, r) {
        //will replace s with r in the text as long as s is in between curly brackets { }

        var isMath = false; //we are between circly brackers

        var i = 0;

        while (i + s.length <= text.length) {
            //we are finding every consecutive string in text with the same length as the search string
            if (text.substring(i, i + 1) === '{') {
                //curly bracket found
                isMath = true; //between curly brackets
                i += 1;
            } else if (text.substring(i, i + 1) === '}') {
                //another curly bracket found
                isMath = false; //no longer between curly brackets
                i += 1;
            } else if (isMath && text.substring(i, i + s.length) === s) {
                //found the search string between curly brackets
                text =
                    text.substring(0, i) +
                    r +
                    text.substring(i + s.length, text.length); //replace the search string with the replace string inside text
                i += r.length; //skip over the replace string part since we don't need to check it
            } else {
                //regular text found
                i += 1; //move onto the next possible string
            }
        }

        return text; //return changed string
    }

    updateState(key, val) {
        if (key === 'type') {
            this.state['answer'] = '';
            this.state['choices'] = [];
            if (val === 'm') {
                this.state['choices'] = [
                    {
                        text: '',
                        correct: true,
                    },
                    {
                        text: '',
                        correct: false,
                    },
                    {
                        text: '',
                        correct: false,
                    },
                    {
                        text: '',
                        correct: false,
                    },
                ];
            }
            this.state['multiplier'] = 100;
        }

        this.state[key] = val;
        this.setState(this.state);
    }

    saveFile(event, files) {
        if (!this.state.imageFile) {
            this.state.imageFile = files;
            this.setState(this.state);
        } else {
            swal('Please remove previous file.', '', 'error');
        }
    }

    unformatMathText(val) {
        val = this.specialReplace(val, 'int_', 'integral');
        val = this.specialReplace(val, 'lim_', 'limit');
        val = this.specialReplace(val, 'sum_', 'sum');

        return val;
    }

    formatMathText(val) {
        val = this.specialReplace(val, 'integral', 'int_');
        val = this.specialReplace(val, 'limit', 'lim_');
        val = this.specialReplace(val, 'sum', 'sum_');

        return val;
    }

    goodAnswer(goodIndex) {
        for (var i = 0; i < this.state['choices'].length; i++) {
            this.state['choices'][i]['correct'] = i === goodIndex;
        }

        this.setState(this.state);
    }

    addAnswerChoice() {
        var choices = this.state['choices'];

        choices.push({
            text: '',
            correct: choices.length === 0,
        });

        this.state['choices'] = choices;

        this.setState(this.state);
    }

    removeAnswerChoice(position) {
        var choices = this.state['choices'];

        choices.splice(position, 1);

        if (choices.length > 0) {
            choices[0]['correct'] = true;
        }

        this.state['choices'] = choices;

        this.setState(this.state);
    }

    choiceChanged(val, position) {
        var choices = this.state['choices'];

        // var position = parseInt(e.target.name);

        choices[position]['text'] = val;

        this.state['choices'] = choices;

        this.setState(this.state);
    }

    addBrackets() {
        //cannot add random math expression if limited
        if (this.props.isLimited) {
            return;
        }

        function getRndInteger(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        let tempMath = [
            "integral(a)^(b) f'(x)*dx=f(b) - f(a)",
            'sum(i=1)^n i^3=((n(n+1))/2)^2',
            'x = (-b +- sqrt(b^2 - 4ac))/(2a)',
        ];

        this.state['question'] += '{' + tempMath[getRndInteger(0, 2)] + '}';
        this.setState(this.state);
    }

    render() {
        let answerStyle = {
            marginTop: '10px',
            backgroundColor: '#',
        };
        let bgStyle = {
            backgroundColor: '#f5f7fa',
            borderRadius: '10px',
            padding: '1em',
            margin: '2px',
        };

        var addHeader = null;

        if (parseInt(this.props.num) === 0) {
            addHeader = (
                <h2 style={{ fontWeight: 'bold', fontSize: '25px' }}>
                    Add Question
                </h2>
            );
        } else {
            addHeader = (
                <h2 style={{ fontWeight: 'bold', fontSize: '25px' }}>
                    Question {this.props.num}
                </h2>
            );
        }

        let questionBody = null;

        let choices = this.state.choices;

        let isLimited = this.props.isLimited;

        if (this.state.type === 'e') {
            questionBody = (
                <div>
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>Question:</label>
                        <TextField
                            id="outlined-multiline-static"
                            label="Type question here..."
                            multiline
                            rows={4}
                            value={this.state.question}
                            variant="filled"
                            name="question"
                            onChange={this.valueChanged}
                            fullWidth
                            InputProps={{
                                readOnly: isLimited,
                            }}
                        >
                            {' '}
                        </TextField>

                        <div style={{ textAlign: 'center' }}>
                            <p>
                                Add curly brackets {'{ }'} in between any math
                                expression to properly format it.
                            </p>
                            <a
                                style={{
                                    color: '#118AB2',
                                    textDecoration: 'underline',
                                    textAlign: 'center',
                                }}
                                onClick={this.addBrackets}
                                target="_blank"
                            >
                                Add Sample Math Expression
                            </a>
                            <br></br>
                            <a
                                style={{
                                    color: '#118AB2',
                                    textDecoration: 'underline',
                                    textAlign: 'center',
                                }}
                                href="http://asciimath.org/#syntax"
                                target="_blank"
                            >
                                Math Expression Syntax
                            </a>
                        </div>
                    </div>

                    {this.state.question.indexOf('{') >= 0 ||
                    this.state.question.indexOf('}') >= 0 ? (
                        <div
                            className="form-group"
                            style={{ whiteSpace: 'pre-wrap' }}
                        >
                            <label style={{ fontWeight: 'bold' }}>
                                Formatted Question:
                            </label>
                            <MathComponent
                                text={this.formatMathText(this.state.question)}
                            />
                        </div>
                    ) : null}

                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>Answer:</label>

                        <div className="rows" style={{ textAlign: 'center' }}>
                            <button
                                className={
                                    'row ' +
                                    (parseInt(this.state.answerType) == 1
                                        ? 'estimathon-div-highlighted'
                                        : 'estimathon-div-regular')
                                }
                                onClick={() => this.changeAnswerType(1)}
                            >
                                <input
                                    readOnly={isLimited}
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#073b4c',
                                        backgroundColor: '#DAF3FC',
                                        margin: 'auto',
                                        width: '200px',
                                    }}
                                    type="tel"
                                    className="form-control"
                                    name="answer"
                                    value={this.state.answer}
                                    placeholder="Enter full answer"
                                    onChange={this.valueChanged}
                                />
                            </button>

                            <button className="row estimathon-div-none">
                                <p className="titleStyle8">OR</p>
                            </button>

                            <button
                                className={
                                    'row ' +
                                    (parseInt(this.state.answerType) == 2
                                        ? 'estimathon-div-highlighted'
                                        : 'estimathon-div-regular')
                                }
                                onClick={() => this.changeAnswerType(2)}
                            >
                                <div className="form-inline">
                                    <input
                                        readOnly={isLimited}
                                        style={{
                                            fontWeight: 'bold',
                                            color: '#073b4c',
                                            backgroundColor: '#DAF3FC',
                                            width: '100px',
                                            marginRight: '5px',
                                        }}
                                        type="tel"
                                        className="form-control"
                                        name="answerBase"
                                        value={this.state.answerBase}
                                        placeholder="Enter base"
                                        onChange={this.valueChanged}
                                    />
                                    <h3
                                        className="titleStyle8"
                                        style={{ marginTop: '5px' }}
                                    >
                                        * 10
                                        <sup>
                                            <input
                                                readOnly={isLimited}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: '#073b4c',
                                                    backgroundColor: '#DAF3FC',
                                                    width: '100px',
                                                    marginLeft: '5px',
                                                    marginTop: '-15px',
                                                }}
                                                type="tel"
                                                className="form-control"
                                                name="answerExp"
                                                value={this.state.answerExp}
                                                placeholder="Enter exponent"
                                                onChange={this.valueChanged}
                                            />
                                        </sup>
                                    </h3>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (this.state.type === 'm') {
            questionBody = (
                <div>
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>Question:</label>
                        <TextField
                            id="outlined-multiline-static"
                            label="Type question here..."
                            multiline
                            rows={4}
                            value={this.state.question}
                            variant="filled"
                            name="question"
                            onChange={this.valueChanged}
                            InputProps={{
                                readOnly: isLimited,
                            }}
                            fullWidth
                        >
                            {' '}
                        </TextField>

                        <div style={{ textAlign: 'center' }}>
                            <p>
                                Add curly brackets {'{ }'} in between any math
                                expression to properly format it.
                            </p>
                            <a
                                style={{
                                    color: '#118AB2',
                                    textDecoration: 'underline',
                                    textAlign: 'center',
                                }}
                                onClick={this.addBrackets}
                                target="_blank"
                            >
                                Add Sample Math Expression
                            </a>
                            <br></br>
                            <a
                                style={{
                                    color: '#118AB2',
                                    textDecoration: 'underline',
                                    textAlign: 'center',
                                }}
                                href="http://asciimath.org/#syntax"
                                target="_blank"
                            >
                                Math Expression Syntax
                            </a>
                        </div>
                    </div>

                    {this.state.question.indexOf('{') >= 0 ||
                    this.state.question.indexOf('}') >= 0 ? (
                        <div
                            className="form-group"
                            style={{ whiteSpace: 'pre-wrap' }}
                        >
                            <label style={{ fontWeight: 'bold' }}>
                                Formatted Question:
                            </label>
                            <MathComponent
                                text={this.formatMathText(this.state.question)}
                            />
                        </div>
                    ) : null}

                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>
                            Number of Points:
                        </label>
                        <Tooltip
                            title="Teams can earn partial points if they have answered more than once for this multiple choice question."
                            arrow
                            placement="top"
                        >
                            <input
                                readOnly={isLimited}
                                placeholder="Enter number of points"
                                min={1}
                                max={10000000}
                                type="number"
                                className="form-control"
                                name="multiplier"
                                onChange={this.valueChanged}
                                value={this.state.multiplier}
                            ></input>
                        </Tooltip>
                    </div>

                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>
                            Answer Choices:
                        </label>
                        {!isLimited ? (
                            <Button
                                style={{
                                    marginBottom: '5px',
                                    backgroundColor: 'transparent',
                                    borderColor: 'transparent',
                                    fontWeight: 'lighter',
                                    color: '#118AB2',
                                    fontSize: '50px',
                                    paddingTop: '0px',
                                    lineHeight: '35px',
                                }}
                                onClick={this.addAnswerChoice}
                            >
                                {' '}
                                +{' '}
                            </Button>
                        ) : null}
                        <br></br>
                        {choices.map((listitem, index) => (
                            <div
                                key={index}
                                className="answerChoice"
                                style={{
                                    position: 'inline',
                                    float: index % 2 === 0 ? 'left' : 'right',
                                    backgroundColor: listitem['correct']
                                        ? '#ffda85'
                                        : 'white',
                                }}
                            >
                                {!isLimited ? (
                                    <MDBCloseIcon
                                        onClick={() =>
                                            this.removeAnswerChoice(index)
                                        }
                                    />
                                ) : null}
                                <p
                                    style={{
                                        textAlign: 'center',
                                        fontSize: '15px',
                                    }}
                                >
                                    {listitem['correct']
                                        ? 'Correct'
                                        : 'Incorrect'}
                                </p>
                                <MathField
                                    automateScroll={true}
                                    readOnly={isLimited}
                                    value={listitem['text']}
                                    onChange={(val) =>
                                        this.choiceChanged(val, index)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else if (this.state.type === 's') {
            questionBody = (
                <div>
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>Question:</label>
                        <TextField
                            id="outlined-multiline-static"
                            label="Type question here..."
                            multiline
                            rows={4}
                            value={this.state.question}
                            variant="filled"
                            name="question"
                            onChange={this.valueChanged}
                            fullWidth
                            InputProps={{
                                readOnly: isLimited,
                            }}
                        >
                            {' '}
                        </TextField>

                        <div style={{ textAlign: 'center' }}>
                            <p>
                                Add curly brackets {'{ }'} in between any math
                                expression to properly format it.
                            </p>
                            <a
                                style={{
                                    color: '#118AB2',
                                    textDecoration: 'underline',
                                    textAlign: 'center',
                                }}
                                onClick={this.addBrackets}
                                target="_blank"
                            >
                                Add Sample Math Expression
                            </a>
                            <br></br>
                            <a
                                style={{
                                    color: '#118AB2',
                                    textDecoration: 'underline',
                                    textAlign: 'center',
                                }}
                                href="http://asciimath.org/#syntax"
                                target="_blank"
                            >
                                Math Expression Syntax
                            </a>
                        </div>
                    </div>
                    {this.state.question.indexOf('{') >= 0 ||
                    this.state.question.indexOf('}') >= 0 ? (
                        <div
                            className="form-group"
                            style={{ whiteSpace: 'pre-wrap' }}
                        >
                            <label style={{ fontWeight: 'bold' }}>
                                Formatted Question:
                            </label>
                            <MathComponent
                                text={this.formatMathText(this.state.question)}
                            />
                        </div>
                    ) : null}
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>
                            Number of Points:
                        </label>
                        <input
                            readOnly={isLimited}
                            placeholder="Enter number of points"
                            min={1}
                            max={10000000}
                            type="number"
                            className="form-control"
                            name="multiplier"
                            onChange={this.valueChanged}
                            value={this.state.multiplier}
                        ></input>
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>Answer:</label>
                        <div style={answerStyle}>
                            <MathField
                                automateScroll={false}
                                readOnly={isLimited}
                                value={this.state.answer}
                                onChange={(val) =>
                                    this.updateState('answer', val)
                                }
                            ></MathField>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Modal
                show={true}
                size="lg"
                dialogClassName=""
                onHide={() => this.props.hideModal()}
            >
                <Modal.Header closeButton>
                    <div>{addHeader}</div>
                </Modal.Header>

                <Modal.Body style={{ align: 'center' }}>
                    <div style={bgStyle} style={{ align: 'center' }}>
                        {parseInt(this.props.gameType) === 1 ? (
                            <Form.Control
                                disabled={isLimited}
                                value={this.state.type}
                                name="type"
                                onChange={this.valueChanged}
                                label="Select Question Type"
                                as="select"
                            >
                                <option value={'e'}>Estimating</option>
                            </Form.Control>
                        ) : (
                            <Form.Control
                                disabled={isLimited}
                                value={this.state.type}
                                name="type"
                                onChange={this.valueChanged}
                                label="Select Question Type"
                                as="select"
                            >
                                <option value="" selected disabled hidden>
                                    Select a Question Type
                                </option>

                                <option readOnly value={'m'}>
                                    Multiple Choice
                                </option>
                                <option readOnly value={'s'}>
                                    Single Answer
                                </option>
                            </Form.Control>
                        )}

                        <br></br>

                        {questionBody}
                    </div>
                </Modal.Body>

                {this.state.type != '' && !isLimited ? (
                    <File
                        deletedFirebaseImage={this.state.deletedFirebaseImage}
                        removeImageFile={this.removeImageFile}
                        imageFile={
                            this.state.imageFile &&
                            typeof this.state.imageFile !== 'string'
                                ? URL.createObjectURL(this.state.imageFile[0])
                                : null
                        }
                        firebaseImage={this.state.image}
                        saveFile={this.saveFile}
                    ></File>
                ) : null}

                {this.state.type != '' && !isLimited ? (
                    <Modal.Footer>
                        <button
                            ref={(modalComp) => {
                                this.modalComp = modalComp;
                            }}
                            className="blue-btn"
                            onClick={this.saveQuestion}
                        >
                            Save
                        </button>
                    </Modal.Footer>
                ) : null}
            </Modal>
        );
    }
}

const File = (props) => {
    const styles = {
        border: '4px solid lightgrey',
        width: '90%',
        padding: 20,
        color: 'grey',
        borderRadius: '10px',
        margin: 'auto',
    };
    var URL = '';
    if (props.firebaseImage && !props.deletedFirebaseImage) {
        URL = props.firebaseImage;
    }
    if (props.imageFile) {
        URL = props.imageFile;
    }

    return (
        <div>
            <div>
                <div className="rows2">
                    <label style={{ fontWeight: 'bold' }}>
                        Question Image:
                    </label>

                    <input
                        style={{ color: 'transparent', marginLeft: '5px' }}
                        type="file"
                        onChange={(event) =>
                            props.saveFile(event, event.target.files)
                        }
                    />
                    <br />
                    <div style={styles}>
                        <FileDrop
                            onFrameDragEnter={(event) => {}}
                            onFrameDragLeave={(event) => {}}
                            onFrameDrop={(event) => {}}
                            onDragOver={(event) => {}}
                            onDragLeave={(event) => {}}
                            onDrop={(files, event) =>
                                props.saveFile(event, files)
                            }
                        >
                            Drop an image here!
                        </FileDrop>
                        <br />
                        {URL.length > 1 ? (
                            <div
                                style={{
                                    aligntItems: 'center',
                                    textAlign: 'center',
                                    width: 'fit-content',
                                    margin: 'auto',
                                }}
                            >
                                <span>
                                    <img
                                        src={URL}
                                        style={{
                                            maxHeight: '300px',
                                            maxWidth: '90%',
                                            height: 'auto',
                                            width: 'auto',
                                            objectFit: 'contain',
                                            borderRadius: '10px',
                                            margin: 'auto',
                                        }}
                                    ></img>
                                    <br></br>
                                    <button
                                        className="red-btn"
                                        style={{ width: '90%', margin: 'auto' }}
                                        onClick={props.removeImageFile}
                                    >
                                        Remove
                                    </button>
                                </span>
                                <br /> <br />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withRouter(questionpopup);
