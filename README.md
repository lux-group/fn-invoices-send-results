# Straight Through Processing (STP) Textract Results 

[![CircleCI](https://circleci.com/gh/brandsExclusive/fn-invoices-send-results.svg?style=svg)](https://circleci.com/gh/brandsExclusive/fn-invoices-send-results)

Lambda function that triggers on new files in S3 le-test-stp-textract-results / le-prod-stp-textract-results and send processed invoice data to svc-invoice. If succeeds, move data from /extracted to /processed.

## Configuration

See config files in `./deploy` folder for lambda naming and S3 bucket names.

## Deployment

To deploy run the following JOBS on jenkins

TODO: configure jenkins

* [TEST](https://jenkins.luxgroup.com/job/release-invoices-send-results-fn/)

* [PRODUCTION](https://jenkins.luxgroup.com/job/release-invoices-send-results-fn/)

To deploy locally install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux-mac.html)
and run the following:

TEST

```
$ yarn deploy-test
```

PRODUCTION

```
$ yarn deploy-production
```

## Logs

To tail logs locally install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux-mac.html)
and run the following:

TEST

```
$ yarn logs-test
```

PRODUCTION

```
$ yarn logs-production
```

## Maintainers

* [Ryan Tian](https://github.com/ryankeeprunning)

## Collaborators
* TBA