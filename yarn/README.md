# Yarn
This action is to replace the standard `yarn` command so that the workflow will exit if there are any warnings.

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: thefrontside/actions/yarn@v1.8
```
