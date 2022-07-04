import './App.css';
import React, { useState } from 'react';

import Home from './Pages/Public_Pages/Home';
import Play from './Pages/Public_Pages/Play';
import Admin from './Pages/Admin_Pages/Admin';
import NewGame from './Pages/Admin_Pages/NewGame';
import Dashboard from './Pages/Admin_Pages/Dashboard';
import Error from './Pages/Error';
import Terms from './Pages/Terms';
import Privacy from './Pages/Privacy';
import Login from './Pages/Admin_Pages/Login';
import Student from './Pages/Public_Pages/Student';
import Register from './Pages/Admin_Pages/Register';
import Loading from './Pages/Loading';
import Reset from './Pages/Admin_Pages/Reset';

import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch,
    Redirect,
    BrowserRouter,
} from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth';

import './style/index.css';

function App() {
    const [authentication, setAuthState] = useState({
        authenticated: false,
        initializing: true,
    });

    React.useEffect(
        () =>
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    setAuthState({
                        authenticated: true,
                        initializing: false,
                    });
                } else {
                    setAuthState({
                        authenticated: false,
                        initializing: false,
                    });
                }
            }),
        [setAuthState],
    );

    if (authentication.initializing) {
        return <Loading />;
    }

    return (
        <main>
            <BrowserRouter>
                <Switch>
                    <Route path={'/'} component={Home} exact />
                    <Route path={'/terms'} component={Terms} exact />

                    <Route path={'/privacy'} component={Privacy} exact />
                    <Route path={'/play/:sample?'} component={Play} exact />
                    <PublicRoute
                        path={'/admin/login'}
                        component={Login}
                        authenticated={!authentication.authenticated}
                    />
                    <Route path={'/students'} component={Student} />
                    <PublicRoute
                        path={'/admin/signup'}
                        component={Register}
                        authenticated={!authentication.authenticated}
                    />
                    <PublicRoute
                        path={'/admin/reset'}
                        component={Reset}
                        authenticated={!authentication.authenticated}
                    />
                    <PrivateRoute
                        path={'/admin/dashboard/:gameid/:isNew?'}
                        component={(props) => <Admin {...props} />}
                        authenticated={authentication.authenticated}
                    ></PrivateRoute>

                    <PrivateRoute
                        path={'/admin/newgame'}
                        component={(props) => <NewGame {...props} />}
                        authenticated={authentication.authenticated}
                    ></PrivateRoute>
                    <PrivateRoute
                        path={'/admin/dashboard'}
                        component={Dashboard}
                        authenticated={authentication.authenticated}
                    />
                    <Route component={Error} />
                </Switch>
            </BrowserRouter>
        </main>
    );
}

//https://stackoverflow.com/questions/58769189/react-router-protected-route-with-firebase-auth-check
//https://medium.com/@subalerts/creating-protected-routes-in-react-js-89e95974a822

const PrivateRoute = ({
    component: Component,
    authenticated: authenticated,
    ...rest
}) => (
    <Route
        {...rest}
        render={(props) =>
            authenticated ? (
                <Component {...props} />
            ) : (
                <Redirect to={{ pathname: '/admin/login' }} />
            )
        }
    />
);

const PublicRoute = ({
    component: Component,
    authenticated: authenticated,
    ...rest
}) => (
    <Route
        {...rest}
        render={(props) =>
            authenticated ? (
                <Component {...props} />
            ) : (
                <Redirect to={{ pathname: '/admin/dashboard' }} />
            )
        }
    />
);

export default App;
