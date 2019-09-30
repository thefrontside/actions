const core = require('@actions/core');
const github = require('@actions/github');

// const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const NPM_AUTH_TOKEN = core.getInput('NPM_AUTH_TOKEN');
// const octokit = new github.GitHub(GITHUB_TOKEN);

async function run() {
  try {
    const regex = /#(\d+)/;
    const commit_message = github.context.payload.head_commit.message;

    if (github.context.payload.number) {
      if (NPM_AUTH_TOKEN) {
        console.log("Secrets detected. Resuming workflow.")
      } else {
        console.log("NPM_AUTH_TOKEN not detected. This either means you forgot to add it to your secrets or this PR was created from a fork.");
        console.log("If you've created a pull request from a fork and would like to publish a preview, you must do so from a pull request in your own repository.");
        console.log("Reminder to change the package name in your json file to avoid a publishing error.");
        core.setFailed("Halting workflow.")
      }
    } else {
      if (github.context.payload.repository.fork && !NPM_AUTH_TOKEN) {
        console.log("You're seeing this message because it seems you're on a forked repository and have not supplied an NPM_AUTH_TOKEN in your repository secrets.")
        console.log("If you wish to publish your own package, you will need to update package name in your json file as well.")
        core.setFailed("Halting workflow.")
      } else {
        if (regex.test(commit_message)) {
          // const pull_request = await octokit.pulls.get({
          //   owner: github.context.repo.owner,
          //   repo: github.context.repo.repo,
          //   pull_number: regex.exec(commit_message)[1]
          // });
          console.log(`Merge #${regex.exec(commit_message)[1]} detected. Resuming workflow.`)
        } else {
          core.setFailed("We suspect this workflow wasn't triggered by a commit made from a merge because we could not locate a PR number in the commit message.")
        }
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  };
};

run();