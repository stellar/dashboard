# Dashboard

Check out [Tech Stack Overview](./TECH_STACK_OVERVIEW.md) document to get
started.

## Dependencies

To build this project, you must have the following dependencies installed:

- Node v22
- NPM

## Installation

```sh
npm install
```

## Developing

```sh
npm run dev
```

### If you wish to use backend server API, you need to have redis running locally on port 6379 (default for redis)

(If you do not have redis installed) If on a mac, install redis using homebrew

```sh
brew install redis
```

(Other install directions can be found [here](https://redis.io/download))

Make sure it's running

```sh
brew services start redis
```

Once you have redis installed, start this command

```sh
npm run start:backend
```

It will create a proxy to `browser-sync` server started by gulp at
`http://localhost:5000`

### Connecting to Big Query

Connecting to Big Query is not required for running the backend (if you run with
UPDATE_DATA=false), but is required for things like catching up ledger data in
redis.

This project is pulling from SDF's `crypto-stellar` public data set, so no
special credentials are required. However you will need a Google Cloud Platform
project with a service account to be able to access Big Query.

Directions for creating a service account
[can be found here](https://cloud.google.com/docs/authentication/getting-started).

Once you've created a service account, add the service account key json file to
the `gcloud` folder under the name `service-account.json`. An example json file
shows what the file structure should look like.
