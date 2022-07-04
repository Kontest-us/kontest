import React from 'react';
import { Spinner } from 'react-bootstrap';
import '../style/index.css';

function Error(props) {
    return (
        <div className={'App'} style={{ background: '#073B4C' }}>
            <Spinner animation="border" role="status">
                <span className="sr-only" style={{ color: 'white' }}>
                    Loading...
                </span>
            </Spinner>
        </div>
    );
}

export default Error;
