# Kontest.us Client

This folder contains the frontend client of the application.

## Getting Started

First, make sure you have [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

Also, make sure you have [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) installed.

To install all of the required node packages, run:

```bash
yarn install
```

Then, in the file `client/src/index.js`, you will have to add credentials for [Firebase Authentication](https://firebase.google.com/docs/auth). You can set this up alongside the [Firebase Realtime Database](https://firebase.google.com/docs/database):

```
firebase.initializeApp({
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
});
```

Then, in `client/src/Pages/Request.js`, you will have to set the API URL. If you are running the app locally, it can be set to localhost.
## Run

To set up, first `cd` into this directory. Then,

```bash
yarn start
```

Before commiting and pushing code to the remote repository, run the command below for formatting:

```bash
yarn format
```

## Deployment

This application can be deployed to any service that hosts frontend applications for free. [Netlify](https://www.netlify.com/) and [Vercel](https://vercel.com/) are great choices. 

After deploying the frontend, you may have to add the frontend's url to `corsOptions` in `api/index.js`.
## Technologies

Built with [React](https://reactjs.org/).
### Code Style

Use [Prettier](https://prettier.io/) and the [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript).

To run, `yarn lint` and `yarn format` in the directory.
