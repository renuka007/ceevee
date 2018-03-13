# Ceevee

[![Build Status](https://travis-ci.org/randallmorey/ceevee.svg?branch=master)](https://travis-ci.org/randallmorey/ceevee)
[![Maintainability](https://api.codeclimate.com/v1/badges/c036800b871740c7cbf1/maintainability)](https://codeclimate.com/github/randallmorey/ceevee/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c036800b871740c7cbf1/test_coverage)](https://codeclimate.com/github/randallmorey/ceevee/test_coverage)

The API server powering the Ceevee app.


## Prerequisites

- [Node][node]
- [Docker][docker] (local)
- [MongoDB][mongodb] (CI and production)


## Docker Recommended

Local development using Docker is recommended.  When using Docker, attached
services (such as MongoDB) are managed automatically.  Although working directly
in Node is possible (e.g. in CI), this README assumes Docker.


## Installation

```
docker-compose run npm install
```


## Testing

```
npm run test:local
```


## Test Coverage

Tests require 100% coverage.  Tests will fail if coverage falls below 100%.


## Local Testing

Run a local instance of the API server with:

```
docker-compose up local
```


## Environment Variables

The following environment variables are used by the application.  Default values
are used when a variable is not set.

- `PORT`:  port number on which API server should listen
- `MONGODB_URI`:  URL of the MongoDB instance to which to connect
- `SENDGRID_API_KEY`:  API key of the [SendGrid][sendgrid] account for email
- `EMAIL_SANDBOX_MODE` (default `true`):  in sandbox mode, outgoing emails are
  never actually sent, useful for testing
- `FROM_EMAIL`:  `from` field for outgoing emails
- `EMAIL_ACTIVATION_URL`:  URL for the activation email sent to new users,
  most likely the frontend activation handler.  Activation token is passed via
  this URL through the `token` query parameter (e.g. `?token=123XYZ`).
- `SERVICE_NAME` (default: `Service`):  name of application as it appears in
  user-facing messages, including email
- `SERVER_NAME` (default: `Server`):  name of the API server (appears in logs)
- `SALT_WORK_FACTOR` (default: `10`):  strength of [bcrypt][bcrypt] hashes
- `MIN_ZXCVBN_PASSWORD_STRENGTH` (default: `2`):  minimum zxcvbn strength score
  for password validation
- `JWT_SECRET`:  the secret key used to sign JSON web tokens
- `JWT_LOGIN_EXPIRES_IN` (default: `7d`):  time from _now_ when login tokens
  expire, expressed in [zeit/ms][zeit/ms]
- `JWT_ACTIVATION_EXPIRES_IN` (default: `1d`):  time from _now_ when activation
  tokens expire, expressed in [zeit/ms][zeit/ms]


[docker]: https://www.docker.com
[node]: https://nodejs.org
[mongodb]: https://www.mongodb.com
[sendgrid]: https://sendgrid.com
[bcrypt]: https://www.npmjs.com/package/bcrypt
[zeit/ms]: https://github.com/zeit/ms
