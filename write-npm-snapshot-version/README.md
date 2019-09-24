# Write NPM Snapshot Version
This action updates the version of your package according to the SHA of the current commit.

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - name: Write NPM Snapshot Version
      uses: thefrontside/actions/write-npm-snapshot-version@master
```