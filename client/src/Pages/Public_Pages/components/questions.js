import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import Question from './singlequestion';
import Divider from '@material-ui/core/Divider';
import waiting from '../../../style/assets/tenor.gif';
import { socket } from '../Game';

class questions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            windowHeight: window.innerHeight,
            colors: [],
            guesses: [],
            answersGuessed: [],
            showAnswers: true,
        };
    }

    componentDidMount() {
        socket.emit(
            'initialScore',
            this.props.gameCode,
            this.props.teamName,
            false,
        );

        //listener for just the team data
        socket.on('singleTeamTable', (data) => {
            //format the data received
            var questionColors = [];

            var guesses = []; //the guesses for each question
            var answersGuessed = []; //the answers guessed by this team for each question (multiple choice will have more than 1)

            var singleTableData = data;

            for (var j = 0; j < singleTableData.scores.length; j++) {
                let points = String(singleTableData.scores[j]);
                if (parseInt(points) === 0) {
                    questionColors.push({
                        color: '#f8fafd',
                        answerStatus: 'none',
                    });
                } else if (points.substring(0, 1) === 'X') {
                    questionColors.push({
                        color: '#f7bfbe',
                        answerStatus: 'bad',
                    });
                } else if (parseInt(points) === 1) {
                    questionColors.push({
                        color: '#aaf0d1',
                        answerStatus: 'perfect',
                    });
                } else {
                    questionColors.push({
                        color: '#aaf0d1',
                        answerStatus: 'good',
                    });
                }

                if (singleTableData.guesses[j]) {
                    guesses.push(parseInt(singleTableData.guesses[j]));
                } else {
                    guesses.push(0);
                }

                if (singleTableData.answers[j]) {
                    answersGuessed.push(singleTableData.answers[j]);
                } else {
                    answersGuessed.push('');
                }
            }

            this.props.updateGuesses(singleTableData['totalGuesses']);

            this.state['colors'] = questionColors;
            this.state['guesses'] = guesses;
            this.state['answersGuessed'] = answersGuessed;
            this.setState(this.state);

            this.props.updateLoaded();
        });

        socket.on('place', (data) => {
            this.props.updateState('place', data);
        });

        socket.on('getAnswers', (data) => {
            this.state.showAnswers = data;
            this.setState(this.state);
            alert(this.state.showAnswers);
        });
    }

    componentWillUnmount() {
        socket.off('singleTeamTable');
        socket.off('scoreTable');
        socket.off('place');
        socket.off('getAnswers');
    }

    render() {
        let bgStyle = {
            backgroundColor: '#f5f7fa',
            borderRadius: '10px',
            padding: '1em',
            margin: '2px',
        };

        let divStyle = null;

        if (window.innerWidth > 1024) {
            divStyle = {
                // height: "fit-content",
                // minHeight:window.innerHeight,
                // width:window.innerWidth -275,
                // // overflowY: 'scroll',
                // backgroundColor: '#f5f7fa',
                // borderRadius: '0px',
                // border:'transparent',
                // alignContent:'center'

                height: 'fit-content',
                minHeight: window.innerHeight,
                width: window.innerWidth - 275,
                // overflowY: 'scroll',
                backgroundColor: '#f5f7fa',
                borderRadius: '0px',
                border: 'transparent',
            };
        } else {
            divStyle = {
                // height: "fit-content",
                // minHeight:window.innerHeight,
                // width:window.innerWidth -275,
                // backgroundColor: '#f5f7fa',
                // borderRadius: '0px',
                // border:'transparent',
                // marginRight:'2px'

                height: 'fit-content',
                minHeight: window.innerHeight,
                width: window.innerWidth - 275,
                // overflowY: 'scroll',
                backgroundColor: '#f5f7fa',
                borderRadius: '0px',
                border: 'transparent',
            };
        }

        let centerStyle = {
            position: 'absolute',
            margin: '2px',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        };

        let textStyle = {
            color: 'black',
        };

        var i = 0;
        function incrementCount() {
            i += 1;
            return i;
        }

        function getCount() {
            return i;
        }

        let divStyle1 = {
            padding: window.innerWidth / 20,
            margin: window.innerWidth / 20,
            width: (window.innerWidth * 5) / 6,
        };

        return (
            <Card style={divStyle}>
                <Card.Body>
                    <h3 className="gameTitle" style={{ fontWeight: 'bold' }}>
                        Questions
                    </h3>
                    <br />

                    <Divider></Divider>
                    <br />

                    {this.props.questions.length === 0 ? (
                        <div style={{ align: 'center' }}>
                            <br /> <br />
                            <p className="gameTitle">
                                There aren't any questions!
                            </p>
                        </div>
                    ) : (
                        this.props.questions.map((listitem, index) => (
                            <Question
                                gameCode={this.props.gameCode}
                                showSubmitQuestionModal={
                                    this.props.showSubmitQuestionModal
                                }
                                answersGuessed={
                                    this.state.answersGuessed.length > index
                                        ? this.state.answersGuessed[index]
                                        : ''
                                }
                                guesses={
                                    this.state.guesses.length > index
                                        ? this.state.guesses[index]
                                        : 0
                                }
                                color={
                                    this.state.colors.length > index
                                        ? this.state.colors[index]
                                        : {
                                              color: '#f8fafd',
                                              removeChoice: true,
                                          }
                                }
                                key={getCount()}
                                ind={incrementCount()}
                                question={listitem}
                            ></Question>
                        ))
                    )}
                    <br></br>
                </Card.Body>
            </Card>
        );
    }
}

export default questions;
