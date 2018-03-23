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


## One-Time Setup

Sensitive environment variables are stored in the `.env` file.  This file is
included in `.gitignore` intentionally, so that it is never committed.
Create a `.env` file and copy into it the contents of `.env.template`.


## Installation

```
docker-compose run npm install
```


## Testing

All tests must pass and test coverage must be 100% for the test script
to succeed.  Run tests locally:

```
npm run test:local
```


## Running

A [SendGrid][sendgrid] API key is required to run the server (but not required
for tests).  An easy way to procure a free SendGrid account for development
is via the [Heroku SendGrid add-on][heroku-sendgrid].  You'll need to create a
new app in Heroku before procuring SendGrid.  Once procured, find the API key
and paste it into your local `.env` file after `SENDGRID_API_KEY=`.


## Running Locally

Run a local instance of the API server:

```
npm run start:local
```


## Environment Variables

The following environment variables are used by the application.  Default values
are used when a variable is not set.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | | port number on which API server should listen |
| `MONGODB_URI` | | URL of the MongoDB instance to which to connect |
| `SENDGRID_API_KEY` | | API key of the [SendGrid][sendgrid] account for email |
| `EMAIL_SANDBOX_MODE` | `true` | in sandbox mode, outgoing emails are never actually sent, useful for testing |
| `FROM_EMAIL` | | `from` field for outgoing emails |
| `EMAIL_ACTIVATION_URL` | | URL target for activation email sent to new users, most likely the frontend activation handler.  Activation token is passed via this URL through the `token` query parameter (e.g. `?token=123XYZ`). |
| `EMAIL_PASSWORD_RESET_URL` | | URL of password reset page sent to users requesting password reset.  Password reset token is passed via this URL through the `token` query parameter (e.g. `?token=123XYZ`). |
| `SERVICE_NAME` | `Service` | name of application as it appears in user-facing messages, including email |
| `SERVER_NAME` | `Server` | name of the API server (appears in logs) |
| `SALT_WORK_FACTOR` | `10` | strength of [bcrypt][bcrypt] hashes |
| `MIN_ZXCVBN_PASSWORD_STRENGTH` | `2` | minimum [zxcvbn][zxcvbn] strength score for password validation |
| `SECURE_KEY` |  | the secret key used to sign JSON web tokens |
| `JWT_LOGIN_EXPIRES_IN` | `7d` | time from _now_ when login tokens expire, expressed in [zeit/ms][zeit/ms] |
| `JWT_ACTIVATION_EXPIRES_IN` | `1d` | time from _now_ when activation tokens expire, expressed in [zeit/ms][zeit/ms] |
| `JWT_PASSWORD_RESET_EXPIRES_IN` | `15m` | time from _now_ when password reset tokens expire, expressed in [zeit/ms][zeit/ms] |


[docker]: https://www.docker.com
[node]: https://nodejs.org
[mongodb]: https://www.mongodb.com
[sendgrid]: https://sendgrid.com
[heroku-sendgrid]: https://elements.heroku.com/addons/sendgrid
[bcrypt]: https://www.npmjs.com/package/bcrypt
[zxcvbn]: https://github.com/dropbox/zxcvbn
[zeit/ms]: https://github.com/zeit/ms


## Contributing

Contributions consistent with the style and quality of existing code are
welcomed.  Be sure to follow the guidelines below.

Check the issues page of this repository for available work.


### Committing

This project follows [a successful git branching model][nvie-git-branching] and
uses [commitizen][commitizen] and
[cz-conventional-changelog][cz-conventional-changelog].  Commitizen helps to
ensure that commit messages remain well-formatted and consistent across
different contributors.

Before committing for the first time, install commitizen:

```
npm install -g commitizen
```

[Watch a helpful video about commitizen][commitizen-video], but follow the
directions here for actual usage within this project.

To start work on a new change, pull the latest `develop` and create
a new _topic branch_ (e.g. `feature-resume-model`, `chore-test-update`,
`bugfix-bad-bug`).  Work should be committed to
[topic branches][nvie-git-branching] only, never directly to mainline branches.
To begin a commit, stage changes as usual:

```
git add .
```

To commit, run the following command (instead of `git commit`) and follow the
directions:

```
npm run commit
```

When committing in this manner, _tests are executed automatically and all tests
must pass before the commit can be finalized_.  If tests fail, please address
the issue(s) and try the commit procedure again.

We recommend making incremental commits at logical stopping points whenever
possible, rather than large monolithic commits at the end of a feature.


### Pull Requests

When a topic branch is ready to merge, submit a pull request from the topic
branch into `develop` via GitHub.  Pull requests are automatically tested in CI
and may only be merged after all checks pass successfully.  At that time,
a core team member may merge the PR into `develop`.


### Issue References

Commit messages and pull requests should
[short link to GitHub issues][issue-autolinking] when referencing information in
the issue.  Though not every commit or PR related for an issue needs to
reference it.  Commits and PRs that fix or resolve an issue should
[close the issue in the message][issue-closing].


[nvie-git-branching]: http://nvie.com/posts/a-successful-git-branching-model/
[commitizen]: https://www.npmjs.com/package/commitizen
[cz-conventional-changelog]: https://www.npmjs.com/package/cz-conventional-changelog
[commitizen-video]: https://egghead.io/lessons/javascript-how-to-write-a-javascript-library-committing-a-new-feature-with-commitizen
[issue-autolinking]: https://help.github.com/articles/autolinked-references-and-urls/
[issue-closing]: https://help.github.com/articles/closing-issues-using-keywords/
