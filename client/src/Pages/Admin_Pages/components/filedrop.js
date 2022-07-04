import React from 'react';
import { FileDrop } from 'react-file-drop';
import './../../../style/index.css';
import '../../../style/buttons.css';
import Gamelist from './gamelist';

export const File = () => {
    const styles = {
        border: '1px solid grey',
        width: 300,
        color: 'grey',
        padding: 20,
    };
    return (
        <div>
            <h1 className="gameTitle">Add Images Here:</h1>
            <div style={styles}>
                <FileDrop
                    onFrameDragEnter={(event) => {}}
                    onFrameDragLeave={(event) => {}}
                    onFrameDrop={(event) => {}}
                    onDragOver={(event) => {}}
                    onDragLeave={(event) => {}}
                    onDrop={(files, event) => {}}
                >
                    Drop some files here!
                </FileDrop>
            </div>
        </div>
    );
};
export default File;
