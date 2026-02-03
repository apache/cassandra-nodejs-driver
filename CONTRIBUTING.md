# Contributing

Thank you for your interest in contributing to the Apache Cassandra Node.js Driver! This repository is now part of the Apache Software Foundation (ASF) and follows Apache contribution practices.

## Ways to Contribute

There are many ways to contribute, including:

- **Bug Reports**: Identify incorrect behavior, inconsistencies, or regressions in the driver. Provide reproduction steps when possible.
- **Feature Requests**: Propose improvements or new functionality. Please describe the use case (not just a proposed API).
- **Documentation Improvements**: Enhance guides, examples, javadocs, or configuration explanations.
- **Pull Requests**: Submit fixes, enhancements, performance improvements, or refactorings.
- **Testing Contributions**: Add missing tests, improve coverage, or enhance test infrastructure.
- **Support & Triage**: Help evaluate reported issues or contribute to discussions.
- **Verify Releases**: Verify the release artifacts work correctly in your environment, when a release is proposed in the mailing list.

### Communication
1. **Mailing List**:
    - https://lists.apache.org/list.html?dev@cassandra.apache.org
2. **JIRA**: 
    - https://issues.apache.org/jira/projects/CASSNODEJS
    - Older issues before the donation can be found at:
      - https://datastax-oss.atlassian.net/projects/NODEJS
3. **GitHub Repository**: https://github.com/apache/cassandra-nodejs-driver
4. **Slack**: #cassandar-drivers channel, in the Apache Software Foundation [Slack](https://infra.apache.org/slack.html). 
Ask in the mailing list for an invite to the Slack workspace.

## Submitting changes

### Submitting Changes (Pull Requests)

All code changes require:

1. **A corresponding JIRA ticket**  
   Include the JIRA key in the PR title, e.g.:  
   `NODEJS-696: Migrate Travis CI to Github Action`
   
2. **A pull request on GitHub**  
   Repository: <https://github.com/apache/cassandra-nodejs-driver>

3. **Tests**  
   Every fix or feature should include or update tests. PRs without tests are rarely accepted.

4. **Documentation updates**  
   Update manual, javadocs, examples, or reference docs when applicable.

5. **Passing CI**  
   PRs must pass all CI jobs unless reviewers explicitly allow exceptions.

6. **Code Review**  
   All PRs require at least two approvals from Apache committers before merging.

7. **Squash after review**  
   After committers' approvals and before merging, please squash commits into one, with a commit message in the following format:  
   ```
   NODEJS-696: Migrate Travis CI to Github Action
   patch by Jane He; reviewed by Abe Ratnofsky and Bret McGuire for NODEJS-696
   ```

## Development Setup

### Prerequisites
- Node.js v20 or later
- npm

### Running Tests Locally
1. Install Cassandra Cluster Manager (CCM) following its [README](https://github.com/apache/cassandra-ccm).
2. On MacOS only, enable loopback aliases:

```shell
for i in {2..255}; do sudo ifconfig lo0 alias 127.0.0.$i up; done
```
Note: This may slow down networking. To remove the aliases after testing:
```shell
for i in {2..255}; do sudo ifconfig lo0 -alias 127.0.0.$i up; done
```

3. Install project dependencies: `npm install`
4. Run the tests: `npx mocha test/unit test/integration/short --recursive --exit`.
You can specify the Cassandra version by the `CCM_VERSION` environment variable, e.g.:
`CCM_VERSION=5.0.2 npx mocha test/unit test/integration/short --recursive --exit`.

## License and CLA

All contributions are made under the Apache License, Version 2.0. The ASF requires a signed Contributor License Agreement (CLA) for non-trivial contributions.
