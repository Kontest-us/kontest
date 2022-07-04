import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../style/index.css';
import '../../../style/buttons.css';
import { MDBCloseIcon } from 'mdbreact';
import Button from 'react-bootstrap/Button';
import { adminGameRequest } from '../../Request';
import swal from 'sweetalert';
import Math from '../../Math';
import firebase from 'firebase/app';
import 'firebase/storage';

class QuestionRow extends React.Component {
    constructor(props) {
        super(props);
        this.deleteQuestion = this.deleteQuestion.bind(this);
        this.loadImage = this.loadImage.bind(this);

        this.state = {
            imageURL: null,
        };

        this.waiting = false; //prevents spamming when deleting questions
    }

    componentDidMount() {
        this.loadImage();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data.image !== this.props.data.image) {
            this.loadImage();
        }
    }

    loadImage() {
        // if there is an image
        if (this.props.data.image.length > 0) {
            // Create a reference to the file we want to download
            var imageRef = firebase
                .storage()
                .ref()
                .child(
                    'questions/' +
                        this.props.gameID +
                        '/' +
                        this.props.data.image,
                );

            // Get the download URL
            imageRef
                .getDownloadURL()
                .then((url) => {
                    // set the url to imageURL state variable
                    this.state.imageURL = url;
                    this.setState(this.state);
                })
                .catch((error) => {
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    switch (error.code) {
                        case 'storage/object-not-found':
                            // File doesn't exist
                            break;
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;
                        case 'storage/canceled':
                            // User canceled the upload
                            break;

                        // ...

                        case 'storage/unknown':
                            // Unknown error occurred, inspect the server response
                            break;
                    }
                });
        } else {
            this.state.imageURL = null;
            this.setState(this.state);
        }
    }

    deleteQuestion() {
        if (this.waiting) {
            return;
        }

        this.waiting = true;

        // Create a reference to the file to delete
        var imageRef = firebase
            .storage()
            .ref()
            .child(
                'questions/' + this.props.gameID + '/' + this.props.data.image,
            );

        // Delete the file
        imageRef
            .delete()
            .then(() => {
                // File deleted successfully
            })
            .catch((error) => {
                //Error comes up if this question didn't have an image
                // console.log(error)
                // Uh-oh, an error occurred!
            });

        if (this.deleteBtn) {
            this.deleteBtn.setAttribute('disabled', 'disabled');
        }

        adminGameRequest(
            'questions/delete',
            'DELETE',
            this.props.gameID,
            {
                id: this.props.id,
            },
            (d) => {
                if (d.success) {
                    this.props.refreshQuestions();
                } else {
                    swal(d.message, '', 'error');
                }
            },
        );
    }

    render() {
        let questionType = this.props.data.t;

        //style for the question div
        let bodyClassName;

        if (questionType === 's') {
            bodyClassName = 'light-yellow-div';
        } else if (questionType === 'm') {
            bodyClassName = 'light-blue-div';
        } else {
            bodyClassName = 'light-white-div';
        }

        let buttonStyle2 = {
            align: 'left',
            marginRight: '10px',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            color: '#073b4c',
            fontWeight: 'bold',
            fontSize: '20px',
            padding: 0,
            margin: 'auto',
            width: '85%',
            whiteSpace: 'pre-wrap',
        };

        let textStyle = {
            fontSize: '20px',
            color: '#073b4c',

            fontWeight: 'bold',
        };

        return (
            <div className={bodyClassName}>
                {!this.props.isLimited ? (
                    <div
                        ref={(deleteBtn) => {
                            this.deleteBtn = deleteBtn;
                        }}
                        style={{ float: 'right' }}
                    >
                        <MDBCloseIcon onClick={this.deleteQuestion} />
                    </div>
                ) : null}

                <div style={{ float: 'left', position: 'absolute' }}>
                    <h5 style={textStyle}>
                        <b style={{ margin: '5px' }}>{this.props.number} )</b>
                    </h5>
                </div>

                <Button
                    style={buttonStyle2}
                    onClick={() =>
                        this.props.openPopup(
                            this.props.data,
                            this.props.number,
                            this.props.id,
                            this.state.imageURL,
                        )
                    }
                >
                    <Math text={this.props.data.q} />
                </Button>

                {this.state.imageURL ? (
                    <img
                        src={this.state.imageURL}
                        className="rows2"
                        style={{
                            maxHeight: '200px',
                            maxWidth: '90%',
                            height: 'auto',
                            width: 'auto',
                            objectFit: 'contain',
                            borderRadius: '10px',
                            margin: 'auto',
                        }}
                    ></img>
                ) : null}

                <br />
            </div>
        );
    }
}

export default QuestionRow;
