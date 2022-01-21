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

### If you wish to use backend server API, you need to have redis running locally on port 6379 (default for redis)

(If you do not have redis installed) If on a mac, install redis using homebrew

```sh
brew install redis
```

(Other install directions can be found here: https://redis.io/download)

Make sure it's running

```sh
brew services start redis
```

Once you have redis installed, start this command

```sh
yarn run start:backend
```

It will create a proxy to `browser-sync` server started by gulp at
`http://localhost:5000`
