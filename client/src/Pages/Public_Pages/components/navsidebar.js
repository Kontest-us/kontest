import { Navigation } from 'react-minimal-side-navigation';
import Icon from 'awesome-react-icons';
import React, { Component, useState } from 'react';
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';

export const NavSidebar = (props) => {
    const [isSidebarOpen] = useState(true);

    return (
        <React.Fragment>
            <div
                className={`inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 ease-out transform translate-x-0 bg-white border-r-2 lg:translate-x-0 lg:static lg:inset-0 ${
                    isSidebarOpen
                        ? 'ease-out translate-x-0'
                        : 'ease-in -translate-x-full'
                }`}
            >
                <div className="flex items-center justify-center mt-10 text-center py-6"></div>

                <Navigation
                    items={[
                        {
                            title: 'Questions',
                            itemId: '1',
                            elemBefore: () => (
                                <Icon name="edit-pencil-simple" />
                            ),
                        },
                    ]}
                    onSelect={() => {
                        props.questions();
                    }}
                />
                <Navigation
                    items={[
                        {
                            title: 'Scoreboard',
                            itemId: '2',
                            elemBefore: () => <Icon name="radio" />,
                        },
                    ]}
                    onSelect={() => {
                        if (props.loaded) {
                            props.scoreboard();
                        }
                    }}
                />

                <Navigation
                    items={[
                        {
                            title: 'Game Rules',
                            itemId: '3',
                            elemBefore: () => <Icon name="bell" />,
                        },
                    ]}
                    onSelect={() => {
                        if (props.loaded) {
                            props.rule();
                        }
                    }}
                />

                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <h1 className="gameTitle" style={{ fontWeight: 'bold' }}>
                        {props.guessCount}/{props.totalGuesses}
                    </h1>
                    <h1 className="gameTitle" style={{ fontSize: '30px' }}>
                        Guess Count
                    </h1>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h1 className="gameTitle" style={{ fontWeight: 'bold' }}>
                        {props.place}
                    </h1>
                    <h1 className="gameTitle" style={{ fontSize: '30px' }}>
                        Place
                    </h1>
                </div>

                <div className="absolute bottom-0 w-full my-8">
                    <Navigation
                        items={[
                            {
                                title: 'Exit',
                                itemId: 'exit',
                                elemBefore: () => <Icon name="x" />,
                            },
                        ]}
                        onSelect={() => {
                            props.exit();
                        }}
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export default NavSidebar;
