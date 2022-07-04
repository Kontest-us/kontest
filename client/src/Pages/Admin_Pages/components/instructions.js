import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import RulesModal from '../../../Pages/Public_Pages/modals/rulesmodal';
import { getDateObject } from '../../Date';

class Instructions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timeText: '',
            showRules: false,
        };

        this.updateTimer = this.updateTimer.bind(this);
    }

    /**
     * called after first render()
     */
    componentDidMount() {
        this.updateTimer();
    }

    updateModal(show) {
        this.state['showRules'] = show;
        this.setState(this.state);
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    updateTimer() {
        function getText(days, hours, minutes, seconds) {
            if (days.toString().length === 1) {
                days = '0' + days;
            }

            if (hours.toString().length === 1) {
                hours = '0' + hours;
            }

            if (minutes.toString().length === 1) {
                minutes = '0' + minutes;
            }

            if (seconds.toString().length < 2) {
                seconds = '0' + seconds;
            }

            return days + ':' + hours + ':' + minutes + ':' + seconds;
        }

        let time = this.props.time;

        var start = getDateObject(time.start);
        var stop = getDateObject(time.end);
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

            let newText =
                'Time Before the Game Starts: ' +
                getText(days, hours, minutes, seconds);

            this.state['timeText'] = newText;
            this.setState(this.state);

            if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
                this.props.updateStatus(2);
                // not start === 1
                // started === 2
            }

            this.timeoutId = setTimeout(() => {
                this.updateTimer();
            }, 1000);
        } else if (now >= start && now <= stop) {
            //game going on

            // Find the distance between now and the count down date
            var distance = stop - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            var minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60),
            );
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            let newText =
                'Time Left: ' + getText(days, hours, minutes, seconds);

            this.state['timeText'] = newText;
            this.setState(this.state);

            // this.props.updateStatus(2)
            // not start == 1
            // started == 2

            this.timeoutId = setTimeout(() => {
                this.updateTimer();
            }, 1000);
        } else {
            // this.props.updateStatus(2)
            // not start == 1
            // started == 2

            this.state['timeText'] = 'Game Over!';
            this.setState(this.state);
        }
    }

    render() {
        let bgStyle = {
            backgroundColor: '#f8fafd',

            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '1em',
            marginTop: '30px',
            width: 'fit-content',
        };

        return (
            <div style={bgStyle} className={'center'}>
                <h1
                    style={{
                        float: 'center',
                        fontWeight: 'bold',
                        color: '#073b4c',
                        fontSize: '25px',
                    }}
                >
                    Join at{' '}
                    <a
                        style={{
                            color: '#118ab2',
                            textDecoration: 'underline',
                        }}
                        href="https://kontest.us/play"
                        target="_blank"
                    >
                        https://kontest.us/play
                    </a>{' '}
                    with the game code: <br />
                    <br />
                    <a style={{ fontSize: '55px', color: '#073b4c' }}>
                        {this.props.gameCode}
                    </a>
                </h1>
                <br></br>

                <button
                    className="blue-btn"
                    style={{ marginRight: '10px', width: '200px' }}
                    onClick={() => this.updateModal(true)}
                >
                    Rules
                </button>
                <br></br>
                <br></br>
                <h1
                    style={{
                        fontWeight: 'bold',
                        fontSize: '25px',
                        color: '#EF476F',
                    }}
                >
                    {this.state['timeText']}
                </h1>

                <br></br>

                <RulesModal
                    showModal={this.state.showRules}
                    type={this.props.gameType}
                    hideModal={() => this.updateModal(false)}
                />
            </div>
        );
    }
}

export default Instructions;
