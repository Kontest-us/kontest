import React from 'react';
import '../style/index.css';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import '../style/buttons.css';

function Error(props) {
    return (
        <div className={'App'}>
            <h1 style={{ fontWeight: 'bold', fontSize: '50px' }}>
                Oops.....Page not found!
            </h1>
            <br />
            <Link to={'/'}>
                <button className="red-btn">Return to Home</button>
            </Link>
        </div>
    );
}

export default Error;
