import { Navigation } from 'react-minimal-side-navigation';
import Icon from 'awesome-react-icons';
import React, { Component, useState } from 'react';
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';
import { FiGlobe } from 'react-icons/fi';

/**
 * side navbar for admin single game dashboard
 * @param props
 * @returns {*}
 * @constructor
 */

export const NavSidebarAdminHome = (props) => {
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
                            title: 'Your Games',
                            itemId: '1',
                            elemBefore: () => (
                                <Icon name="edit-pencil-simple" />
                            ),
                        },
                    ]}
                    onSelect={() => {
                        props.games();
                    }}
                />

                <Navigation
                    items={[
                        {
                            title: 'Public Games',
                            itemId: '1',
                            elemBefore: () => <FiGlobe size="20px" />,
                        },
                    ]}
                    onSelect={() => {
                        props.publicGames();
                    }}
                />

                <Navigation
                    items={[
                        {
                            title: 'Account Info',
                            itemId: '3',
                            elemBefore: () => <Icon name="settings" />,
                        },
                    ]}
                    onSelect={() => {
                        props.account();
                    }}
                />

                <div className="absolute bottom-0 w-full my-8">
                    <Navigation
                        items={[
                            {
                                title: 'Log Out',
                                itemId: 'logout',
                                elemBefore: () => <Icon name="user" />,
                            },
                        ]}
                        onSelect={() => {
                            props.logout();
                        }}
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export default NavSidebarAdminHome;
