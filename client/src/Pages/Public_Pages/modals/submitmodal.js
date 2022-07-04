import React from 'react';
import '../../../style/index.css';
import '../../../style/buttons.css';

import { withRouter } from 'react-router-dom';
import { studentRequest } from '../../Request';
import Modal from 'react-bootstrap/Modal';
import Confetti from 'react-confetti';
import Divider from '@material-ui/core/Divider';
import MathText from '../../Math';
import MathField from '../../MathField';
// import { emojisplosions } from "emojisplosion";
import { Firework } from '../../Fireworks';

let MAX_WIDTH = 1100;

class Submit extends React.Component {
    constructor(props) {
        super(props);

        this.valueChanged = this.valueChanged.bind(this);
        this.updateState = this.updateState.bind(this);
        this.sendAnswer = this.sendAnswer.bind(this);
        this.getPreviousAnswer = this.getPreviousAnswer.bind(this);
        this.setMultAnswer = this.setMultAnswer.bind(this);
        this.changeBoundType = this.changeBoundType.bind(this);
        this.calculatePotentialPoints =
            this.calculatePotentialPoints.bind(this);
        this.divideNumbers = this.divideNumbers.bind(this);

        this.state = {
            studentName: this.props.studentName,
            teamName: this.props.studentTeam,
            lowBound: '',
            highBound: '',
            lowBoundBase: '',
            highBoundBase: '',
            lowBoundExp: '',
            highBoundExp: '',
            answer: '',
            message: '',
            success: true,
            previousAnswer: '',
            celebration: 'none',
            selectedMult: -1,
            correctAnswer: false,
            imageCode: null,
            imageURL: null,
            lowerBoundType: 1, //1 - basic number that allows for e, 2 - base and exponent
            upperBoundType: 1,
        };
    }

    componentDidMount() {
        this.getPreviousAnswer();
    }

    componentWillUnmount() {
        clearTimeout(this.fireworkTimeOut);
    }

    changeBoundType(bound, type) {
        //changes the bound type for estimathon questions
        this.state[bound] = parseInt(type);
        this.setState(this.state);
    }

    getPreviousAnswer() {
        var studentName = this.state.studentName;
        var teamName = this.state.teamName;

        //every time the component mounts, get the last answer submitted
        studentRequest(
            'game/getPreviousAnswer',
            'POST',
            this.props.gameCode,
            {
                studentTeam: teamName,
                studentName: studentName,
                questionNum: this.props.questionNum,
            },
            (d) => {
                if (d.success) {
                    this.state['previousAnswer'] = d.data;
                    this.setState(this.state);
                } else {
                    this.state['message'] = d.message;
                    this.state['success'] = false;
                    this.setState(this.state);
                }
            },
        );
    }

    valueChanged(e) {
        this.updateState(e.target.name, e.target.value);
    }

    updateState(key, val) {
        this.state[key] = val;
        this.setState(this.state);
    }

    sendAnswer() {
        /* Getting values from state */

        var studentName = this.state.studentName;
        var teamName = this.state.teamName;
        var questionNum = this.props.questionNum;

        var answer = this.state.answer;

        var questionData =
            this.props.questions[parseInt(this.props.questionNum - 1)];

        var gameType = questionData.type;

        var lowBound;
        var highBound;

        if (parseInt(this.state.lowerBoundType) == 1) {
            lowBound = this.state.lowBound;
        } else {
            lowBound = this.state.lowBoundBase + 'e' + this.state.lowBoundExp;
        }

        if (parseInt(this.state.upperBoundType) == 1) {
            highBound = this.state.highBound;
        } else {
            highBound =
                this.state.highBoundBase + 'e' + this.state.highBoundExp;
        }

        /* Validating values */

        lowBound = lowBound.replace(/,/g, ''); //removes commas
        highBound = highBound.replace(/,/g, ''); //removes commas
        answer = answer.replace(/,/g, ''); //removes commas

        var message = '';

        if (gameType === 'e') {
            if (
                studentName === '' ||
                teamName === '' ||
                questionNum === '' ||
                lowBound === '' ||
                highBound === ''
            ) {
                message = 'Please fill in all of the fields.';
            } else if (
                String(lowBound).length > 12 ||
                String(highBound).length > 12
            ) {
                message =
                    'Your bounds are too large. Please enter the number using e notation (ex: 2e3 for 2000)';
            } else if (isNaN(lowBound) || isNaN(highBound)) {
                message = 'Please enter numbers as your bounds.';
            }
        } else if (gameType === 'm') {
            if (
                studentName === '' ||
                teamName === '' ||
                questionNum === '' ||
                answer === ''
            ) {
                message = 'Please select an answer choice.';
            }
        } else if (gameType === 's') {
            if (
                studentName === '' ||
                teamName === '' ||
                questionNum === '' ||
                answer === ''
            ) {
                message = 'Please enter a value';
            } else if (String(answer).length > 500) {
                message = 'Your answer is too long. Please try condensing it.';
            }
        }

        if (
            parseInt(questionNum) > this.props.questions.length ||
            parseInt(questionNum) <= 0
        ) {
            message = 'You have not entered a valid question number.';
        }

        /* Validation failed */

        if (message !== '') {
            this.state['message'] = message;
            this.state['success'] = false;
            this.state['correctAnswer'] = false;
            this.setState(this.state);

            return;
        }

        /* Format answers */

        var questionID = this.props.questions[parseInt(questionNum) - 1].id;

        var studentAnswer = {};

        if (gameType === 'm' || gameType === 's') {
            studentAnswer = {
                answer: answer,
            };
        } else if (gameType === 'e') {
            studentAnswer = {
                upperBound: String(highBound),
                lowerBound: String(lowBound),
            };
        }

        /* Disable submit button */

        if (this.submitBtn) {
            this.submitBtn.setAttribute('disabled', 'disabled');
        }

        studentRequest(
            'game/submitAnswer',
            'POST',
            this.props.gameCode,
            {
                questionId: questionID,
                questionOrder: questionNum - 1, //questionNum is known as questionOrder in the backend
                studentAnswer: studentAnswer,
                teamName: teamName,
                studentName: studentName,
            },
            (d) => {
                if (this.submitBtn) {
                    this.submitBtn.removeAttribute('disabled');
                }

                //success
                if (d.success) {
                    sessionStorage.setItem('studentName', studentName);
                    sessionStorage.setItem('teamName', teamName);

                    this.state['questionNum'] = questionNum;
                    this.state['message'] = d.message;
                    this.state['correctAnswer'] = d.isCorrect;
                    this.state['success'] = true;
                    this.state['selectedMult'] = -1;

                    if (d.isCorrect) {
                        let random = Math.random();

                        if (random < 0.33) {
                            this.state['celebration'] = 'fireworks';
                        } else if (random < 0.66) {
                            this.state['celebration'] = 'confetti';
                        } else {
                            this.state['celebration'] = 'confetti2';
                        }
                    }

                    this.setState(this.state);
                    this.getPreviousAnswer();
                } else {
                    this.state['message'] = d.message;
                    this.state['correctAnswer'] = false;
                    this.state['success'] = false;
                    this.state['selectedMult'] = -1;

                    this.setState(this.state);
                }
            },
        );
    }

    setMultAnswer(index, ans, hasBeenGuessed) {
        if (!hasBeenGuessed) {
            this.state['answer'] = ans;
            this.state['selectedMult'] = index;

            this.setState(this.state);
        }
    }

    divideNumbers(a, b) {
        //first, convert a and b into scientific notation

        if (a.indexOf('e') < 0) {
            a = String(Number(a).toExponential());
        }

        if (b.indexOf('e') < 0) {
            b = String(Number(b).toExponential());
        }

        //next, get constant and power

        let a_eIndex = a.indexOf('e');
        let b_eIndex = b.indexOf('e');

        let a_first = a.substring(0, a_eIndex);
        let b_first = b.substring(0, b_eIndex);

        let a_second = a.substring(a_eIndex + 1, a.length);
        let b_second = b.substring(b_eIndex + 1, b.length);

        //Just to prevent dividing really large numbers
        if (Number(a_second) - Number(b_second) > 5) {
            return 'None (try decreasing the distance between your lower and upper bound)';
        }

        let val =
            (Number(a_first) / Number(b_first)) *
            Math.pow(10, Number(a_second) - Number(b_second));

        //Val might be subject to floating point error, so we do the following:
        //source: https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
        val = parseFloat(val).toPrecision(12);

        //Finally apply floor, giving those who answer 500-2499 a better score than those who answered 500-2500
        val = Math.floor(val);

        //The max that val can be is 999. Thus, we must catch this

        if (val > 999) {
            return 'None (try decreasing the distance between your lower and upper bound)';
        }

        return val;
    }

    calculatePotentialPoints() {
        var lowBound;
        var highBound;

        if (parseInt(this.state.lowerBoundType) == 1) {
            lowBound = this.state.lowBound;
        } else {
            lowBound = this.state.lowBoundBase + 'e' + this.state.lowBoundExp;
        }

        if (parseInt(this.state.upperBoundType) == 1) {
            highBound = this.state.highBound;
        } else {
            highBound =
                this.state.highBoundBase + 'e' + this.state.highBoundExp;
        }

        /* Validating values */

        lowBound = lowBound.replace(/,/g, ''); //removes commas
        highBound = highBound.replace(/,/g, ''); //removes commas

        if (lowBound != '' && highBound != '') {
            return this.divideNumbers(highBound, lowBound);
        }

        return 'None';
    }

    render() {
        var errorMessage = null;

        var color = '#EF476F';
        if (this.state.correctAnswer) {
            color = '#049f76';
        } else {
            color = '#EF476F';
        }

        if (this.state.message !== '') {
            let errorStyle = {
                color: color,
                fontSize: '20px',
                textAlign: 'center',
            };
            errorMessage = <p style={errorStyle}>{this.state.message}</p>;
        }

        let answerChoices = null;

        var questionData =
            this.props.questions[parseInt(this.props.questionNum - 1)];

        let choices = questionData.choices || [];
        let numChoices = choices.length;

        //a list of bad choices. This will contain any answer choices that the player has already guessed.
        let badChoices = [];
        //this is a list of answer choices that have not been guessed.
        let alteredChoices = [];

        //string of answer/answers that this person has guesed
        let answersGuessed = this.state.previousAnswer;

        //only get marked status if there are multiple answer choices
        for (var i = 0; i < numChoices; i++) {
            let choice = choices[i];

            if (answersGuessed.indexOf(choice) >= 0) {
                badChoices.push(choice);
            } else {
                alteredChoices.push(choice);
            }
        }

        let textStyle = {
            color: '#093145',
            fontSize: '18px',
            marginBottom: '5px',
            fontWeight: 'bold',
        };

        let bgStyle = {
            backgroundColor: '#f8fafd',

            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            margin: 'auto',
            marginTop: '10px',
            width: '80%',
        };

        //Below, we get the answer choices

        if (questionData.type === 'e') {
            answerChoices = (
                <div className="form-group">
                    <p className="titleStyle4">Lower Guess</p>

                    <div className="rows">
                        <button
                            className={
                                'row ' +
                                (parseInt(this.state.lowerBoundType) == 1
                                    ? 'estimathon-div-highlighted'
                                    : 'estimathon-div-regular')
                            }
                            onClick={() =>
                                this.changeBoundType('lowerBoundType', 1)
                            }
                        >
                            <input
                                style={{
                                    fontWeight: 'bold',
                                    color: '#073b4c',
                                    backgroundColor: '#DAF3FC',
                                    margin: 'auto',
                                    width: '150px',
                                }}
                                type="tel"
                                className="form-control"
                                name="lowBound"
                                value={this.state.lowBound}
                                placeholder="500"
                                onChange={this.valueChanged}
                            />
                        </button>

                        <button className="row estimathon-div-none">
                            <p className="titleStyle8">OR</p>
                        </button>

                        <button
                            className={
                                'row ' +
                                (parseInt(this.state.lowerBoundType) == 2
                                    ? 'estimathon-div-highlighted'
                                    : 'estimathon-div-regular')
                            }
                            onClick={() =>
                                this.changeBoundType('lowerBoundType', 2)
                            }
                        >
                            <div className="form-inline">
                                <input
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#073b4c',
                                        backgroundColor: '#DAF3FC',
                                        width: '50px',
                                        marginRight: '5px',
                                    }}
                                    type="tel"
                                    className="form-control"
                                    name="lowBoundBase"
                                    value={this.state.lowBoundBase}
                                    placeholder="5"
                                    onChange={this.valueChanged}
                                />
                                <h3
                                    className="titleStyle8"
                                    style={{ marginTop: '5px' }}
                                >
                                    * 10
                                    <sup>
                                        <input
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#073b4c',
                                                backgroundColor: '#DAF3FC',
                                                width: '50px',
                                                marginLeft: '5px',
                                                marginTop: '-15px',
                                            }}
                                            type="tel"
                                            className="form-control"
                                            name="lowBoundExp"
                                            value={this.state.lowBoundExp}
                                            placeholder="2"
                                            onChange={this.valueChanged}
                                        />
                                    </sup>
                                </h3>
                            </div>
                        </button>
                    </div>

                    <p className="titleStyle4">Upper Guess</p>

                    <div className="rows">
                        <button
                            className={
                                'row ' +
                                (parseInt(this.state.upperBoundType) == 1
                                    ? 'estimathon-div-highlighted'
                                    : 'estimathon-div-regular')
                            }
                            onClick={() =>
                                this.changeBoundType('upperBoundType', 1)
                            }
                        >
                            <input
                                style={{
                                    fontWeight: 'bold',
                                    color: '#073b4c',
                                    backgroundColor: '#DAF3FC',
                                    margin: 'auto',
                                    width: '150px',
                                }}
                                type="tel"
                                className="form-control"
                                name="highBound"
                                value={this.state.highBound}
                                placeholder="2500"
                                onChange={this.valueChanged}
                            />
                        </button>

                        <button className="row estimathon-div-none">
                            <p className="titleStyle8">OR</p>
                        </button>

                        <button
                            className={
                                'row ' +
                                (parseInt(this.state.upperBoundType) == 2
                                    ? 'estimathon-div-highlighted'
                                    : 'estimathon-div-regular')
                            }
                            onClick={() =>
                                this.changeBoundType('upperBoundType', 2)
                            }
                        >
                            <div className="form-inline">
                                <input
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#073b4c',
                                        backgroundColor: '#DAF3FC',
                                        width: '50px',
                                        marginRight: '5px',
                                    }}
                                    type="tel"
                                    className="form-control"
                                    name="highBoundBase"
                                    value={this.state.highBoundBase}
                                    placeholder="2.5"
                                    onChange={this.valueChanged}
                                />
                                <h3
                                    className="titleStyle8"
                                    style={{ marginTop: '5px' }}
                                >
                                    * 10
                                    <sup>
                                        <input
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#073b4c',
                                                backgroundColor: '#DAF3FC',
                                                width: '50px',
                                                marginLeft: '5px',
                                                marginTop: '-15px',
                                            }}
                                            type="tel"
                                            className="form-control"
                                            name="highBoundExp"
                                            value={this.state.highBoundExp}
                                            placeholder="3"
                                            onChange={this.valueChanged}
                                        />
                                    </sup>
                                </h3>
                            </div>
                        </button>
                    </div>

                    <p className="titleStyle8">
                        Potential Points: {this.calculatePotentialPoints()}
                    </p>
                </div>
            );
        } else if (questionData.type === 'm') {
            if (this.state.correctAnswer) {
                answerChoices = (
                    <div>
                        <p style={{ textAlign: 'center' }}>
                            Great job, now do the rest🙂!
                        </p>
                    </div>
                );
            } else if (alteredChoices.length === 1) {
                answerChoices = (
                    <div>
                        <p style={{ textAlign: 'center' }}>
                            No more choices left😞!
                        </p>
                    </div>
                );
            } else {
                answerChoices = (
                    <div>
                        <p style={{ textAlign: 'center' }}>
                            Click below to choose an answer.
                        </p>

                        <div
                            style={{
                                margin: 'auto',
                                width: '100%',
                                alignContent: 'center',
                                justifyContent: 'space-evenly',
                                height: 'fit-content',
                                display: 'flex',
                                flexWrap: 'wrap',
                            }}
                        >
                            {questionData.choices.map((listitem, index) => (
                                <div
                                    onClick={() =>
                                        this.setMultAnswer(
                                            index,
                                            listitem,
                                            badChoices.indexOf(listitem) >= 0,
                                        )
                                    }
                                    key={index}
                                    className={
                                        'answerChoice3 ' +
                                        (badChoices.indexOf(listitem) >= 0
                                            ? 'crossed'
                                            : '')
                                    }
                                    style={{
                                        display: 'inline-block',
                                        width: '45%',
                                        marginTop: '5px',
                                        backgroundColor:
                                            index === this.state.selectedMult
                                                ? '#ffda85'
                                                : 'white',
                                    }}
                                >
                                    <div style={{ float: 'left' }}>
                                        <MathText
                                            text={
                                                String.fromCharCode(
                                                    index + 65,
                                                ) +
                                                ' ) {' +
                                                listitem +
                                                '}'
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <br></br>
                    </div>
                );
            }
        } else if (questionData.type === 's') {
            answerChoices = (
                <div className="form-group">
                    <MathField
                        automateScroll={true}
                        readOnly={false}
                        value={this.state.answer}
                        onChange={(val) => this.updateState('answer', val)}
                    />
                </div>
            );
        }

        let canShowSubmit =
            (alteredChoices.length !== 1 && !this.state.correctAnswer) ||
            (this.state.correctAnswer &&
                this.props.questions[parseInt(this.props.questionNum - 1)]
                    .type === 'e');

        let celebration = null;

        let clearCelebration = () => {
            this.state['celebration'] = 'none';
            this.setState(this.state);
        };

        let pieceCount = 700;

        if (window.innerWidth <= MAX_WIDTH) {
            pieceCount = 300;
        }

        if (this.state.celebration === 'fireworks') {
            celebration = <Firework />;
            this.fireworkTimeOut = setTimeout(clearCelebration, 5000);
        } else if (this.state.celebration === 'confetti') {
            celebration = (
                <Confetti
                    onConfettiComplete={clearCelebration}
                    colors={[
                        '#ef476f',
                        '#ffd166',
                        '#06d6a0',
                        '#118ab2',
                        '#073b4c',
                    ]}
                    style={{
                        zIndex: 200,
                        left: -window.innerWidth / 3,
                        top: -window.innerWidth / 10,
                    }}
                    recycle={false}
                    numberOfPieces={pieceCount}
                    width={window.innerWidth * 2}
                    height={window.innerHeight * 1.2}
                ></Confetti>
            );
        } else if (this.state.celebration === 'confetti2') {
            celebration = (
                <Confetti
                    drawShape={(ctx) => {
                        ctx.beginPath();
                        for (let i = 0; i < 22; i++) {
                            const angle = 0.35 * i;
                            const x = (0.2 + 1.5 * angle) * Math.cos(angle);
                            const y = (0.2 + 1.5 * angle) * Math.sin(angle);
                            ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                        ctx.closePath();
                    }}
                    onConfettiComplete={clearCelebration}
                    colors={[
                        '#ef476f',
                        '#ffd166',
                        '#06d6a0',
                        '#118ab2',
                        '#073b4c',
                    ]}
                    style={{
                        zIndex: 200,
                        left: -window.innerWidth / 3,
                        top: -window.innerWidth / 10,
                    }}
                    recycle={false}
                    numberOfPieces={pieceCount}
                    width={window.innerWidth * 2}
                    height={window.innerHeight * 1.2}
                ></Confetti>
            );
        }

        return (
            <Modal
                className="submitModal"
                show={this.props.showModal}
                style={{ textAlign: 'center', padding: '20px' }}
                size="lg"
                onHide={this.props.hideModal}
            >
                {celebration}

                <Modal.Header closeButton>
                    <br /> <br />
                    <h3
                        style={{
                            textAlign: 'center',
                            margin: '15px',
                            fontSize: '25px',
                            fontWeight: 'bold',
                        }}
                    >
                        Submit an Answer for Question {this.props.questionNum}
                    </h3>
                </Modal.Header>

                <Modal.Body>
                    <div className="form-group">
                        <h3
                            style={{
                                fontWeight: 'bold',
                                fontSize: '25px',
                                float: 'left',
                            }}
                        >
                            {this.props.questionNum}.
                        </h3>
                        <h5
                            style={{
                                textAlign: 'center',
                                fontSize: '25px',
                                width: '85%',
                                margin: 'auto',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            <MathText
                                text={
                                    this.props.questions[
                                        parseInt(this.props.questionNum) - 1
                                    ].question
                                }
                            />
                        </h5>

                        <br />

                        <img
                            src={this.props.imageURL}
                            className="rows2"
                            style={{
                                maxHeight: '250px',
                                maxWidth: '90%',
                                height: 'auto',
                                width: 'auto',
                                objectFit: 'contain',
                                borderRadius: '10px',
                                margin: 'auto',
                            }}
                        ></img>

                        {questionData.type !== 'm' ? (
                            <div>
                                <br></br>
                                <MathText
                                    style={{
                                        textAlign: 'center',
                                        fontSize: '17.5px',
                                    }}
                                    text={
                                        'Previous Answer: {' +
                                        this.state.previousAnswer +
                                        '}'
                                    }
                                />
                            </div>
                        ) : null}
                    </div>
                    <Divider style={{ color: 'black' }}></Divider>
                    <br></br>
                    {answerChoices}

                    <div className="form-group">
                        {errorMessage}

                        {canShowSubmit ? (
                            <button
                                className="form-control dark-green-btn"
                                style={{
                                    align: 'center',
                                    margin: '0 auto',
                                    width: '400px',
                                }}
                                ref={(submitBtn) => {
                                    this.submitBtn = submitBtn;
                                }}
                                onClick={this.sendAnswer}
                            >
                                Submit
                            </button>
                        ) : (
                            <button
                                className="red-btn"
                                style={{
                                    align: 'center',
                                    margin: '0 auto',
                                    marginTop: '15px',
                                    width: '400px',
                                }}
                                onClick={this.props.hideModal}
                            >
                                Return to Questions
                            </button>
                        )}
                    </div>
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                </Modal.Body>
            </Modal>
        );
    }
}

export default withRouter(Submit);
