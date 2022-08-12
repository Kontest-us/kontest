# Kontest.us API

This folder contains the backend api of the application.

## Getting Started

First, make sure you have [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

Also, make sure you have [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) installed.

Next, run `cd api` to move to this directory.

To install all of the required node packages, run:

```bash
yarn install
```

Then, set the necessary environment variables by creating a `development.env` file in the `api` folder. Populate the file with the following:

```
PORT=8000
TYPE=
PROJECT_ID=
PRIVATE_KEY_ID=
PRIVATE_KEY=
CLIENT_EMAIL=
CLIENT_ID=
AUTH_URI=
TOKEN_URI=
AUTH_PROVIDER=
CLIENT_CERT_URL=
```

Most of the env variables refer to credentials for the [Firebase Realtime Database](https://firebase.google.com/docs/database), which will have to be setup.

Finally, run:

```bash
yarn start
```

This will create a server on [http://localhost:8000](http://localhost:9000).

## Run

To run the API at any future time, use the following command:

```bash
yarn start
```

Before commiting and pushing code to the remote repository, run the command below for formatting:

```bash
yarn format
```

# Deployment

This can can be deployed as a standalone, Node.js application. [Heroku](https://devcenter.heroku.com/articles/deploying-nodejs) is a 
great service to use for free. 

## Technologies

Built with [Express](https://expressjs.com/), [Socket.io](https://socket.io/), and [Firebase](https://firebase.google.com/).

### Code Style

Use [Prettier](https://prettier.io/).