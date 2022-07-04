import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';

class cell extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return this.props.keys.map((key, index) => {
            return <td key={this.props.data[key]}>{this.props.data[key]}</td>;
        });
    }
}

export default cell;
