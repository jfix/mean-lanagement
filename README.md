# Retrieve 'Leandicators' from Redmine

This is a small script that sends requests to Redmine's API and aggregates the results.  The results are calculated for the past week.

## Requirements

You need `node` and `npm`. If in a corporate environment you may need to set `http_proxy` and `https_proxy` values for the npm and the git repository.

Still applicable for corporate environments, when checking out the repository, _don't use SSH but HTTPS_.

## Configuration

1. Create a `_env` file that will contain a couple of 'sensitive' values, such as the Redmine URL and the API token. Use the `_env.sample` file as the basis
  - get the API token from the Redmine account URL `[host]/redmine/my/account`. Make sure you have logged in as the Redmine admin user because you may not be a member of all the projects
  - use the correct Redmine URL `[host]/redmine/issues.json`
  - no need to touch the `CONFIG_FILE`
1. `npm install` will retrieve the dependencies

## Run

`node index.js`

The result should look something like this:

```
Period: 2018-01-28 - 2018-02-04:
support stock: 133
support new: 6
feature stock: 140
feature new: 9
```

* `support stock` are existing, unresolved support tickets
* `support new` are tickets that have been created during that period
* `feature stock` are existing user stories and feature requests that have not been worked on yet
* `feature new` are new stories being added in the period under consideration. We don't use this indicator.

> Note that there is also a dated JSON file in the `output` directory which contains the details.  To fill in the Obaya indicators, the command line output is enough.
