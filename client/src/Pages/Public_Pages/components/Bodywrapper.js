import React, { Component } from 'react';

class Bodywrapper extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="relative min-h-screen">
                <main className="w-full min-h-screen">
                    {this.props.children}
                </main>
            </div>
        );
    }
}

export default Bodywrapper;
