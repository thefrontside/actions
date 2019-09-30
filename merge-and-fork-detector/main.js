const core = require('@actions/core');
const github = require('@actions/github');

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const NPM_AUTH_TOKEN = core.getInput('NPM_AUTH_TOKEN');
const octokit = new github.GitHub(GITHUB_TOKEN);

// check conmmit to see merged by looking for #1-9
// check if fork

async function run() {
  try {
    const regex = /#(\d+)/;
    const commit_message = github.context.payload.head_commit.message;

    if (github.context.payload.repository.fork && !NPM_AUTH_TOKEN) {
      // only checking for npm_auth_token if it's a fork
      console.log("this means it's a fork AND you provided no token")
    } else {
      if (regex.test(commit_message)) {
        const pull_request = await octokit.pulls.get({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          pull_number: regex.exec(commit_message)[1]
        });
        console.log(pull_request);
      } else {
        console.log("We suspect this workflow wasn't triggered by a commit made from a merge because we could not locate a PR number in the commit message.")
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  };
};

run();