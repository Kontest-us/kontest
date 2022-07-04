import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';

class SampleScoreboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            table: [
                {
                    name: 'Number Ninjas',
                    Q1: '0',
                    Q2: '0',
                    Q3: '0',
                    Q4: '0',
                    Q5: '0',
                    place: '0',
                    points: '0',
                },
                {
                    name: 'Talking Titans',
                    Q1: '0',
                    Q2: '0',
                    Q3: '0',
                    Q4: '0',
                    Q5: '0',
                    place: '0',
                    points: '0',
                },
                {
                    name: 'Binary Wizards',
                    Q1: '0',
                    Q2: '0',
                    Q3: '0',
                    Q4: '0',
                    Q5: '0',
                    place: '0',
                    points: '0',
                },
                {
                    name: 'History Heros',
                    Q1: '0',
                    Q2: '0',
                    Q3: '0',
                    Q4: '0',
                    Q5: '0',
                    place: '0',
                    points: '0',
                },
                {
                    name: 'Sine Me Up',
                    Q1: '0',
                    Q2: '0',
                    Q3: '0',
                    Q4: '0',
                    Q5: '0',
                    place: '0',
                    points: '0',
                },
                {
                    name: 'Mighty Chondria',
                    Q1: '0',
                    Q2: '0',
                    Q3: '0',
                    Q4: '0',
                    Q5: '0',
                    place: '0',
                    points: '0',
                },
            ],
        };
        this.updateTimer = this.updateTimer.bind(this);
        this.getKeys = this.getKeys.bind(this);
        this.getHeader = this.getHeader.bind(this);
        this.getRowsData = this.getRowsData.bind(this);
    }

    componentDidMount() {
        this.updateTimer();
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    updateTimer() {
        let randomInt = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        let randomIndex = randomInt(0, 5);
        let randomPoints = randomInt(1, 10) * 10;
        let randomQuestion = randomInt(1, 5);

        var tempTable = this.state.table;

        let curr_val = tempTable[randomIndex]['Q' + randomQuestion];

        if (curr_val === '0') {
            //no answer
            if (Math.random() < 0.3) {
                tempTable[randomIndex]['Q' + randomQuestion] = 'X';
            } else {
                tempTable[randomIndex]['Q' + randomQuestion] =
                    String(randomPoints);
            }
        } else if (curr_val.substring(0, 1) === 'X') {
            //X
            if (Math.random() < 0.3) {
                tempTable[randomIndex]['Q' + randomQuestion] += 'X';
            } else {
                tempTable[randomIndex]['Q' + randomQuestion] =
                    String(randomPoints);
            }
        } else {
            //answer
            tempTable[randomIndex]['Q' + randomQuestion] = String(
                parseInt(curr_val) + randomPoints,
            );
        }

        //then, calculate scores

        for (var i = 0; i < 6; i++) {
            let sum = 0;
            for (var j = 1; j <= 5; j++) {
                if (!isNaN(tempTable[i]['Q' + j])) {
                    sum = sum + parseInt(tempTable[i]['Q' + j]);
                }
            }
            tempTable[i]['points'] = String(sum);
        }

        //next, sort

        tempTable.sort(function (a, b) {
            return parseInt(b['points']) - parseInt(a['points']);
        });

        //finally, assign place

        for (var i = 0; i < 6; i++) {
            tempTable[i]['place'] = i + 1;
        }

        //reset after 1000 points
        if (tempTable[0]['points'] > 1000) {
            this.setState({
                table: [
                    {
                        name: 'Lab Rats',
                        Q1: '0',
                        Q2: '0',
                        Q3: '0',
                        Q4: '0',
                        Q5: '0',
                        place: '0',
                        points: '0',
                    },
                    {
                        name: 'Feed Me Pi',
                        Q1: '0',
                        Q2: '0',
                        Q3: '0',
                        Q4: '0',
                        Q5: '0',
                        place: '0',
                        points: '0',
                    },
                    {
                        name: 'Pluto Space Wizards',
                        Q1: '0',
                        Q2: '0',
                        Q3: '0',
                        Q4: '0',
                        Q5: '0',
                        place: '0',
                        points: '0',
                    },
                    {
                        name: 'Limit Breakers',
                        Q1: '0',
                        Q2: '0',
                        Q3: '0',
                        Q4: '0',
                        Q5: '0',
                        place: '0',
                        points: '0',
                    },
                    {
                        name: 'Data Pirates',
                        Q1: '0',
                        Q2: '0',
                        Q3: '0',
                        Q4: '0',
                        Q5: '0',
                        place: '0',
                        points: '0',
                    },
                    {
                        name: 'Hack Inversion',
                        Q1: '0',
                        Q2: '0',
                        Q3: '0',
                        Q4: '0',
                        Q5: '0',
                        place: '0',
                        points: '0',
                    },
                ],
            });
        } else {
            this.setState({
                table: tempTable,
            });
        }

        this.timeoutId = setTimeout(() => {
            this.updateTimer();
        }, 1500);
    }

    getKeys() {
        if (this.state.table.length > 0) {
            return Object.keys(this.state.table[0]);
        }
        return Object.keys({});
    }

    getHeader() {
        var keys = this.getKeys();

        if (keys.length === 0) {
            return null;
        } else {
            return keys.map((key, index) => {
                return <th key={key}>{key.toUpperCase()}</th>;
            });
        }
    }

    getRowsData() {
        var items = this.state.table;
        var keys = this.getKeys();

        if (keys.length === 0) {
            return null;
        }

        return items.map((row, index) => {
            return (
                <tr key={index}>
                    <RenderRow key={index} data={row} keys={keys} />
                </tr>
            );
        });
    }

    render() {
        let header = this.getHeader();
        let rows = this.getRowsData();

        return (
            <div style={{ textAlign: 'center', alignContent: 'center' }}>
                <table style={{ width: '100%', height: '100%' }}>
                    <thead id="table-head">
                        <tr>{header}</tr>
                    </thead>
                    <tbody id="table-body">{rows}</tbody>
                </table>
            </div>
        );
    }
}

export default SampleScoreboard;

const RenderRow = (props) => {
    var keyNum = 0;

    function incrementKey() {
        keyNum += 1;
        return keyNum;
    }

    return props.keys.map((key, index) => {
        if (
            key != 'guesses' &&
            key != 'points' &&
            key != 'name' &&
            key != 'place'
        ) {
            if ((props.data[key] + '').includes('X')) {
                return (
                    <td
                        style={{
                            backgroundColor: '#CC9999',
                        }}
                        key={incrementKey()}
                    >
                        {props.data[key]}
                    </td>
                );
            } else if (props.data[key] === '0') {
                return (
                    <td
                        style={{
                            backgroundColor: '#FAFAD2',
                            color: 'gray',
                        }}
                        key={incrementKey()}
                    >
                        N/A
                    </td>
                );
            } else {
                return (
                    <td
                        style={{
                            backgroundColor: '#aaf0d1',
                            color: 'black',
                        }}
                        key={incrementKey()}
                    >
                        {props.data[key]}
                    </td>
                );
            }
        } else if (key === 'place' && props.data[key] === '1') {
            return (
                <td
                    style={{
                        backgroundColor: '#06D6A0',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                    key={incrementKey()}
                >
                    {props.data[key]}
                </td>
            );
        } else if (key === 'name') {
            return (
                <td
                    style={{
                        backgroundColor: '#3a6e7f',
                        fontWeight: 'bold',
                        color: 'white',
                    }}
                    key={incrementKey()}
                >
                    {props.data[key]}
                </td>
            );
        } else {
            return (
                <td
                    style={{
                        backgroundColor: '#FFFFFF',
                    }}
                    key={incrementKey()}
                >
                    {props.data[key]}
                </td>
            );
        }
    });
};
