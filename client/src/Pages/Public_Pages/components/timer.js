import React from 'react';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { withRouter } from 'react-router-dom';
import { getDateObject } from '../../Date';

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newTime: '',
            color: 'black',
            timeout: null,
            dayState: '',
            hourState: '',
            minuteState: '',
            secondState: '',
            showTime: true,
        };
        this.updateTimer = this.updateTimer.bind(this);
    }

    componentDidMount() {
        this.updateTimer();
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    updateTimer() {
        if (this.props.start === '' || this.props.stop === '') {
            this.timeoutId = setTimeout(() => {
                this.updateTimer();
            }, 1000);
            return;
        }

        var start = getDateObject(this.props.start);
        var stop = getDateObject(this.props.stop);

        var now = new Date().getTime();

        if (now < start) {
            //game hasn't started

            // Find the distance between now and the count down date
            var distance = start - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            var minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60),
            );
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            var t =
                days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';

            this.setState({
                newTime: 'Time before the game starts: ',
                color: '#073B4C',
                dayState: days,
                hourState: hours,
                minuteState: minutes,
                secondState: seconds,
                showTime: true,
            });

            this.timeoutId = setTimeout(() => {
                this.updateTimer();
            }, 1000);
        } else if (now >= start && now < stop) {
            //game going on

            //give user option to go to the game
            this.props.showPlayGame();

            this.setState({
                newTime: 'The game has started: ',
                color: '#073B4C',
                dayState: 0,
                hourState: 0,
                minuteState: 0,
                secondState: 0,
                showTime: false,
            });
        } else {
            //game is over

            //give user option to go to the game
            this.props.showPlayGame();

            this.setState({
                newTime: 'The game has ended: ',
                color: '#073B4C',
                dayState: 0,
                hourState: 0,
                minuteState: 0,
                secondState: 0,
                showTime: false,
            });
        }
    }

    render() {
        let timerStyle = {
            fontWeight: 'bold',
            alignContent: 'center',
            fontSize: '50px',
            color: this.state.color,
        };
        let textStyle = {
            color: this.state.color,
        };
        let rowStyle = {
            margin: '10px',
            alignContent: 'center',
        };

        return (
            <div style={{ textAlign: 'center' }}>
                <div style={{ textAlign: 'center', alignContent: 'center' }}>
                    <h5
                        style={{
                            textAlign: 'center',
                            color: this.state.color,
                            fontSize: window.innerWidth / 40,
                            fontWeight: 'bold',
                        }}
                    >
                        {this.state.newTime}
                    </h5>
                    <br />
                    {this.state.showTime ? ( //only show the time when the game has yet to start
                        <div className="timerRow">
                            <div className="timerRows" style={rowStyle}>
                                <h1 style={timerStyle}>
                                    {' '}
                                    {this.state.dayState}
                                </h1>
                                <p style={textStyle}>DAYS</p>
                            </div>
                            <div className="timerRows" style={rowStyle}>
                                <h1 style={timerStyle}>
                                    {' '}
                                    {this.state.hourState}
                                </h1>
                                <p style={textStyle}>HOURS</p>
                            </div>
                            <div className="timerRows" style={rowStyle}>
                                <h1 style={timerStyle}>
                                    {' '}
                                    {this.state.minuteState}
                                </h1>
                                <p style={textStyle}>MINUTES</p>
                            </div>
                            <div className="timerRows" style={rowStyle}>
                                <h1 style={timerStyle}>
                                    {' '}
                                    {this.state.secondState}
                                </h1>
                                <p style={textStyle}>SECONDS</p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default withRouter(Timer);
