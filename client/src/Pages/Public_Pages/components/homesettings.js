import React from 'react';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';

class homesettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            windowHeight: window.innerHeight,
        };
    }

    render() {
        let divStyle = {
            height: 'fit-content',
            minHeight: window.innerHeight,
            width: window.innerWidth - 275,
            backgroundColor: '#F5F7FA',
            borderRadius: '0px',
            border: 'transparent',
        };

        let bgStyle = {
            backgroundColor: '#f8fafd',

            borderColor: '#dfe3e6',
            boxShadow: '3px 3px 3px 3px #dfe3e6',
            borderWidth: 2,
            borderRadius: '10px',
            padding: '5em',
            marginTop: '10px',
            width: 'fit-content',
        };

        function formatDate(d) {
            if (d === '') {
                return '';
            }

            var s = d.split(' ')[0].split('-');
            var time = d.split(' ')[1].split(':');

            var date = new Date(s[0], s[1] - 1, s[2], time[0], time[1], 0);
            var date1 = new Date();

            var s = date.toDateString() + ' ' + date.toLocaleTimeString();

            return s;
        }

        return (
            <Card style={divStyle}>
                <Card.Body>
                    <h3 className="gameTitle" style={{ fontWeight: 'bold' }}>
                        Settings
                    </h3>
                    <br />
                    <div style={bgStyle} className={'center'}>
                        <div
                            style={{ float: 'center', textAlign: 'center' }}
                            className="center"
                        >
                            <table>
                                <tbody>
                                    <tr>
                                        <td
                                            style={{
                                                backgroundColor: '#06d6a0',
                                                color: 'white',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Start
                                        </td>
                                        <td
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: 'black',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {formatDate(
                                                this.props.settings.start,
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td
                                            style={{
                                                backgroundColor: '#ef4765',
                                                color: 'white',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            End
                                        </td>
                                        <td
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: 'black',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {' '}
                                            {formatDate(
                                                this.props.settings.end,
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td
                                            style={{
                                                backgroundColor: 'lightred',
                                                color: 'black',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {' '}
                                            Guesses Allowed
                                        </td>
                                        <td
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: 'black',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {' '}
                                            {this.props.settings.totalGuesses}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td
                                            style={{
                                                backgroundColor: 'lightred',
                                                color: 'black',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Total Questions
                                        </td>
                                        <td
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: 'black',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {' '}
                                            {this.props.settings.totalQuestions}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        );
    }
}

export default homesettings;
