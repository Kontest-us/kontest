import React from 'react';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { FiHome } from 'react-icons/fi';
import MathText from '../../Math';
import firebase from 'firebase/app';
import 'firebase/storage';

class singlequestion extends React.Component {
    constructor(props) {
        super(props);
        this.loadFirebaseImage = this.loadFirebaseImage.bind(this);
        this.state = {
            imageURL: null,
        };
    }

    componentDidMount() {
        this.loadFirebaseImage();
    }

    loadFirebaseImage() {
        if (this.props.question.image.length > 0) {
            // Create a reference to the file we want to download
            var imageRef = firebase
                .storage()
                .ref()
                .child(
                    'questions/' +
                        this.props.gameCode +
                        '/' +
                        this.props.question.image,
                );

            // Get the download URL
            imageRef
                .getDownloadURL()
                .then((url) => {
                    // set the url to imageURL state variable
                    this.state.imageURL = url;
                    this.setState(this.state);
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
        }
    }

    render() {
        function shadeColor(color, percent) {
            var R = parseInt(color.substring(1, 3), 16);
            var G = parseInt(color.substring(3, 5), 16);
            var B = parseInt(color.substring(5, 7), 16);

            R = parseInt((R * (100 + percent)) / 100);
            G = parseInt((G * (100 + percent)) / 100);
            B = parseInt((B * (100 + percent)) / 100);

            R = R < 255 ? R : 255;
            G = G < 255 ? G : 255;
            B = B < 255 ? B : 255;

            var RR =
                R.toString(16).length === 1
                    ? '0' + R.toString(16)
                    : R.toString(16);
            var GG =
                G.toString(16).length === 1
                    ? '0' + G.toString(16)
                    : G.toString(16);
            var BB =
                B.toString(16).length === 1
                    ? '0' + B.toString(16)
                    : B.toString(16);

            return '#' + RR + GG + BB;
        }

        let bgStyle = {
            backgroundColor: this.props.color['color'], //default is #f8fafd

            borderColor: shadeColor(this.props.color['color'], -10),
            boxShadow:
                '3px 3px 3px 3px ' + shadeColor(this.props.color['color'], -10),
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            marginTop: '10px',
            height: '100%',
            overflow: 'auto',
            textAlign: 'center',
        };

        let textStyle = {
            fontSize: '20px',
            color: '#073b4c',

            fontWeight: 'bold',
        };

        let textStyle2 = {
            fontSize: '20px',
            color: '#073b4c',

            fontWeight: 'bold',
            margin: 'auto',
            width: '85%',
            whiteSpace: 'pre-wrap',
        };

        let textStyle3 = {
            fontSize: '20px',
            color: '#06ac7f',

            fontWeight: 'bold',
        };

        let goodAnswer = this.props.question['a'] || '';

        var answerText = '';
        let questionType = this.props.question.type;

        if (questionType === 'e') {
            answerText = 'Estimate';
        } else if (questionType === 'm') {
            answerText = 'Choose';
        } else if (questionType === 's') {
            answerText = 'Enter';
        }

        //user cannot submit an answer if one of the following cases is met
        //1. answers have been given
        //2. estimation question and perfect answer
        //3. multiple choice and doesn't have perfect answer or no more choices remain
        //4. single answer and good or perfect answers

        let numChoices = (this.props.question.choices || []).length;
        let currentGuesses = this.props.guesses;

        let canNotSubmitAnswer =
            'a' in this.props.question && this.props.question['a'] != '';
        canNotSubmitAnswer =
            canNotSubmitAnswer ||
            (this.props.color['answerStatus'] === 'perfect' &&
                questionType === 'e');
        canNotSubmitAnswer =
            canNotSubmitAnswer ||
            (currentGuesses >= numChoices - 1 && questionType === 'm');
        canNotSubmitAnswer =
            canNotSubmitAnswer ||
            (questionType === 'm' &&
                (this.props.color['answerStatus'] === 'good' ||
                    this.props.color['answerStatus'] === 'perfect'));
        canNotSubmitAnswer =
            canNotSubmitAnswer ||
            (questionType === 's' &&
                (this.props.color['answerStatus'] === 'good' ||
                    this.props.color['answerStatus'] === 'perfect'));

        //This is used for marking a cross or highlighing an answer choice.
        //In this component, we get a list of answers that this team has previously guessed.
        //Based on this, we can decide the marked status for each answer choice.
        let markedStatus = {};
        //0 - do nothing
        //1 - cross out
        //2 - highlight

        //string of answer/answers that this person has guesed
        let answersGuessed = this.props.answersGuessed;

        //get the last choice. If this question is right, then the last choice should be the correct answer
        var lastChoice = answersGuessed.split('`');
        lastChoice = lastChoice[lastChoice.length - 1];

        //only get marked status if there are multiple answer choices
        for (var i = 0; i < numChoices; i++) {
            let choice = this.props.question.choices[i];

            if (answersGuessed.indexOf(choice) >= 0) {
                if (
                    this.props.color['answerStatus'] === 'good' ||
                    this.props.color['answerStatus'] === 'perfect'
                ) {
                    if (lastChoice === choice) {
                        markedStatus[choice] = 2;
                    } else {
                        markedStatus[choice] = 1;
                    }
                } else {
                    markedStatus[choice] = 1;
                }
            } else {
                markedStatus[choice] = 0;
            }
        }

        let pointsDiv = null;

        if (questionType != 'e') {
            let pointsAvailable = this.props.question.multiplier;

            //factor in partial points
            if (questionType === 'm') {
                // console.log(currentGuesses)

                //correct answer
                if (
                    this.props.color['answerStatus'] === 'good' ||
                    this.props.color['answerStatus'] === 'perfect'
                ) {
                    //partial points based on the rule that one wrong guess halfs points available
                    let pointMult = 1 / Math.pow(2, currentGuesses - 1); //don't count last guess since it was correct
                    pointMult = Math.round(pointMult * 100) / 100;
                    pointsAvailable *= pointMult;
                } //0 choices left, no way to earn any points
                else if (currentGuesses >= numChoices - 1) {
                    pointsAvailable = 0;
                } else {
                    //partial points based on the rule that one wrong guess halfs points available
                    let pointMult = 1 / Math.pow(2, currentGuesses);
                    pointMult = Math.round(pointMult * 100) / 100;
                    pointsAvailable *= pointMult;
                }

                if (pointsAvailable > 1) {
                    pointsAvailable = Math.round(pointsAvailable);
                } else {
                    pointsAvailable = Math.round(pointsAvailable * 100) / 100;
                }
            }

            pointsDiv = (
                <div style={{ float: 'right', position: 'relative' }}>
                    <h5 style={textStyle3}>
                        <b style={{ margin: '5px' }}>
                            {pointsAvailable +
                                (pointsAvailable === 1 ? ' point' : ' points')}
                        </b>
                    </h5>
                </div>
            );
        }

        //The current math formatting doesn't include any line breaks.
        //This function deals with this issue by separating the answerChoice into separate lines
        let formattedAnswerChoice = (answerChoice) => {
            /*
        The strategy is as follows:

        Take the answerChoice "asd1"23"ab"7/2. We will split it up based on the number of characters allowed per line (assume 4): "asd|1"23|"ab"|7/2. We look at the 
        start and beginning of each line, ignoring the first start. If it is a ", we skip it. Otherwise, we look at the last actual " in answerChoice and see if it was the start or end of a piece of text. If it was the start, then we add in an extra ". Otherwise, we skip it.

        This can be done in O(n) by keeping track of whether the last " was the start or end and appending onto all_lines once we reach the end.

        Flaws: When there is really long math/text and one word or single expression gets split up.

        */

            let all_lines = ''; //the text with linebreaks
            let i = 0; //counter
            const size = 18; //the number of characters allowed in one line
            const length = answerChoice.length; //the number of characters in the answerChoice

            let isText = false; //as we iterate over each character in answerChoice, we need to know if that character is part of text or is math
            let curr_line = '{'; //the current line

            while (i < length) {
                //get the current character
                let curr_char = answerChoice.substring(i, i + 1);

                //invert if we reach a quotation mark
                if (curr_char === '"') {
                    isText = !isText;
                }

                if ((i > 0 && i % size === 0) || i === length - 1) {
                    /*We need to append new line. There are 4 potential cases:
            1: "asd"| => here, we add normally
            2: 1/2"| => here, we skip
            3: "asd|asd" => here, we add a " at the end before |
            4: "1/2+2| => here, we add normally
            */
                    if (isText && curr_char !== '"') {
                        //The last " was the start of a piece of text
                        all_lines += curr_line + curr_char + '"}';
                    } else if (isText && curr_char === '"') {
                        all_lines += curr_line + '}';
                    } else {
                        all_lines += curr_line + curr_char + '}';
                    }
                    curr_line = '{';
                } else if (
                    i > 1 &&
                    i % size === 1 &&
                    isText &&
                    curr_char != '"'
                ) {
                    //beginning of a new line, but still part of now disconnected text
                    curr_line += '"' + curr_char;
                } else {
                    //just add the char to the line
                    curr_line += curr_char;
                }

                i += 1;
            }

            return all_lines;
        };

        return (
            <div style={bgStyle}>
                {pointsDiv}

                <div style={{ float: 'left', position: 'absolute' }}>
                    <h5 style={textStyle}>
                        <b style={{ margin: '5px' }}>{this.props.ind} )</b>
                    </h5>
                </div>

                {'a' in this.props.question &&
                this.props.question['a'] != '' ? (
                    <div>
                        <div style={textStyle2}>
                            <MathText text={this.props.question.q} />
                        </div>

                        {!(
                            this.props.question.choices &&
                            this.props.question.choices.length > 0
                        ) ? (
                            <div className="correctAnswer">
                                <MathText
                                    text={
                                        'Answer: {' +
                                        this.props.question.a +
                                        '}'
                                    }
                                />
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div>
                        <div style={textStyle2}>
                            <MathText text={this.props.question.q} />
                        </div>
                    </div>
                )}
                <br />

                <div
                    style={{
                        width: '90%',
                        margin: 'auto',
                        alignContent: 'center',
                        justifyContent: 'space-evenly',
                        height: 'fit-content',
                        display: 'flex',
                        flexWrap: 'wrap',
                    }}
                >
                    {this.props.question.choices.map((listitem, index) => (
                        <div
                            key={index}
                            className={
                                'answerChoice2 ' +
                                (parseInt(markedStatus[listitem]) === 1
                                    ? 'crossed'
                                    : '')
                            }
                            style={{
                                backgroundColor:
                                    goodAnswer === listitem ||
                                    parseInt(markedStatus[listitem]) === 2
                                        ? '#ffda85'
                                        : 'transparent',
                                width: '45%',
                                marginTop: '5px',
                            }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <MathText
                                    text={
                                        String.fromCharCode(index + 65) +
                                        ') {' +
                                        listitem +
                                        '}'
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {this.state.imageURL ? (
                    <img
                        src={this.state.imageURL}
                        className="rows2"
                        style={{
                            maxHeight: '200px',
                            maxWidth: '90%',
                            height: 'auto',
                            width: 'auto',
                            objectFit: 'contain',
                            borderRadius: '10px',
                            margin: 'auto',
                        }}
                    ></img>
                ) : null}

                {canNotSubmitAnswer ? null : (
                    <button
                        className="trans-dark-blue-btn"
                        style={{
                            background: 'transparent',
                            marginTop: '10px',
                            width: '150px',
                        }}
                        onClick={() =>
                            this.props.showSubmitQuestionModal(
                                this.props.ind,
                                this.state.imageURL,
                            )
                        }
                    >
                        {answerText}
                    </button>
                )}
            </div>
        );
    }
}

export default singlequestion;
