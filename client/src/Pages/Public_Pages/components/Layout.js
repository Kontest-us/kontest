import React from 'react';

import { NavSidebar } from './navsidebar';
import BodyWrapper from './Bodywrapper';

export const DashboardLayout = (props) => {
    return (
        <BodyWrapper>
            <div className="flex h-screen bg-gray-200">
                <NavSidebar
                    place={props.place}
                    loaded={props.loaded}
                    totalGuesses={props.totalGuesses}
                    guessCount={props.guessCount}
                    rule={() => props.rules()}
                    exit={() => props.exit()}
                    questions={() => props.questions()}
                    scoreboard={() => props.scoreboard()}
                    settings={() => props.settings()}
                    timer={() => props.timer()}
                />

                <div
                    className="flex flex-col flex-1 overflow-scroll"
                    style={{ width: window.innerWidth - 275 }}
                >
                    <main className="content">
                        <section className="sm:flex-row flex flex-col flex-1">
                            <div
                                className="content-box"
                                style={{ flexGrow: 2, flexBasis: '0%' }}
                            >
                                {props.children}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </BodyWrapper>
    );
};
