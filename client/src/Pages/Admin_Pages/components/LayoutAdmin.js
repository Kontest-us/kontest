import React from 'react';

import { NavSidebarAdmin } from './navsidebaradmin';
import { NavSidebarAdminHome } from './SideNavAdminHome';
import BodywrapperAdmin from './BodywrapperAdmin';

/**
 * Parent is BodyWrapperAdmin, children are sidenavbaradmin and sidenavbaradminhome
 * @param props
 * @returns {*}
 * @constructor
 */

export const DashboardLayoutAdmin = (props) => {
    let navbar = null;
    if (props.home) {
        navbar = (
            <NavSidebarAdminHome
                games={() => props.games()}
                publicGames={() => props.publicGames()}
                account={() => props.account()}
                logout={() => props.logout()}
            />
        );
    } else {
        if (!props.isFullScreen) {
            navbar = (
                <NavSidebarAdmin
                    adminStatus={props.adminStatus}
                    isLive={props.isLive}
                    instructions={() => props.instructions()}
                    teams={() => props.teams()}
                    livegame={() => props.livegame()}
                    questions={() => props.questions()}
                    logout={() => props.logout()}
                    settings={() => props.settings()}
                />
            );
        }
    }

    return (
        <BodywrapperAdmin>
            <div className="flex h-screen bg-gray-200">
                {navbar}

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
        </BodywrapperAdmin>
    );
};
