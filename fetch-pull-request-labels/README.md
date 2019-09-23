# Fetch Pull Request Labels
This action retrieves the labels of a pull request and outputs them as `PR_LABELS` available between steps within a job.

# Requirements
You must pass in your `GITHUB_TOKEN` as shown below.

# Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - name: Fetch Pull Request Labels
      uses: thefrontside/actions/fetch-pull-request-labels@master
      id: fetch-pull-request-labels
      with:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - run: echo ${{ steps.fetch-pull-request-labels.outputs.PR_LABELS }}
```