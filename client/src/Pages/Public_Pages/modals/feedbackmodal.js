import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import Modal from 'react-bootstrap/Modal';

function FeedbackModal(props) {
    var ending = '';
    var place = props.place.toString();
    var lastNumber = place.substring(place.length - 1, place.length);
    var color = '';
    var className = 'button-glow';

    if (place.substring(0, 1) === '1') {
        color = '#aaf0d1';
    } else {
        color = '#dddddd';
        className = 'shadow-all-around';
    }

    if (lastNumber === '1') {
        ending = 'st';
    } else if (lastNumber === '2') {
        ending = 'nd';
    } else if (lastNumber === '3') {
        ending = 'rd';
    } else {
        ending = 'th';
    }

    return (
        <Modal
            style={{ textAlign: 'center', padding: '20px' }}
            show={props.showModal}
            size="lg"
            onHide={props.hideModal}
        >
            <Modal.Header closeButton>
                <br /> <br />
                <h1 className="titleStyle2">Your team got...</h1>
            </Modal.Header>

            <Modal.Body
                style={{
                    textAlign: 'center',
                    alignContent: 'left',
                    marginLeft: '40px',
                    marginRight: '40px',
                }}
            >
                <button
                    className={className}
                    style={{
                        margin: '0 auto',
                        fontSize: '70px',
                        fontWeight: 'bold',
                        color: '#073b4c',
                        align: 'center',
                        backgroundColor: color,
                        borderRadius: '50%',
                        borderWidth: '3px',
                        borderColor: 'green',
                        height: '3.4em',
                        width: '3.4em',
                        outline: 'none',
                    }}
                >
                    {props.place}
                    {ending} !
                </button>
                <br />
                <br />
                <b className="titleStyle6">
                    Please check the scoreboard to find out who won. You can
                    also close this window to see the correct answers.
                    <br />
                    <br />
                    We hope you had a great time!
                </b>
                <br />
                <br />

                <b className="titleStyle5">
                    If you had any issues while using this site, please{' '}
                    <a
                        href="https://forms.gle/cmSG6zKbuciWuAWe7"
                        style={{
                            color: '#118ab2',
                            textDecoration: 'underline',
                        }}
                        target="_blank"
                    >
                        report them here!
                    </a>
                </b>
            </Modal.Body>
        </Modal>
    );
}

export default FeedbackModal;
