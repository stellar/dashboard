# Dashboard

## Dependencies

To build this project, you must have the following dependencies installed:

- node 10.16.3
- yarn

## Installation

```sh
yarn
```

## Developing

```sh
yarn start
```

### If you wish to use backend server API, you need a postgres db running with dashboard database

(If you do not have postgres installed) Install postgres using homebrew

```sh
brew install postgres
```

Run postgres

```sh
pg_ctl -D /usr/local/var/postgres start
```

Create dashboard db

```sh
createdb dashboard
```

Once you have postgres installed, start this command

```sh
UPDATE_DATA=true DEV=true node app.js
```

It will create a proxy to `browser-sync` server started by gulp at
`http://localhost:5000`
