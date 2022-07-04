import React from 'react';
import ReactExport from 'react-export-excel';
import '../../../../style/index.css';
import '../../../../style/buttons.css';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export class Download extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.answers.length > 0 && this.props.scores.length > 0) {
            return (
                <ExcelFile
                    filename={`${this.props.gameCode}_Kontest_Report`}
                    element={
                        <button
                            style={{ width: '250px', marginLeft: '10px' }}
                            className="dark-blue-btn"
                        >
                            Download Score Report
                        </button>
                    }
                >
                    {this.props.scores.length > 0 ? (
                        <ExcelSheet data={this.props.scores} name="Scores">
                            {Object.keys(this.props.scores[0]).map(
                                (key, index) => (
                                    <ExcelColumn
                                        key={index}
                                        label={key.toUpperCase()}
                                        value={key}
                                    />
                                ),
                            )}
                        </ExcelSheet>
                    ) : null}

                    {this.props.answers.length > 0 ? (
                        <ExcelSheet data={this.props.answers} name="Answers">
                            {Object.keys(this.props.answers[0]).map(
                                (key, index) => (
                                    <ExcelColumn
                                        label={key.toUpperCase()}
                                        value={key}
                                    />
                                ),
                            )}
                        </ExcelSheet>
                    ) : null}
                </ExcelFile>
            );
        } else {
            return null;
        }
    }
}
