const core = require('@actions/core');
const github = require('@actions/github');

const NPM_AUTH_TOKEN = core.getInput('NPM_AUTH_TOKEN');

/*
case 1 = it's on a PR but no npm_auth_token
case 2 = it is a PR but no npm_auth_token
  case 2.1 = it's a fork
  case 2.2 = it's not a fork
case 3 = it's a fork with no token so fail
case 4 = commit has pr number so success
case 5 = commit has no pr number so fail
*/

// only runs if
// 1. Workflow is triggered by a pull request and NPM_AUTH_TOKEN is accessible.
// 2. In non-PR, as long as it's not a fork and missing token. see case 3

async function run() {
  try {
    // for PR
    if (github.context.payload.number) {
      // case 1
      if (NPM_AUTH_TOKEN) {
        console.log("Secrets detected. Resuming workflow.")
      }
      // case 2
      else {
        // case 2.1
        if (github.context.payload.repository.fork) {
          console.log("NPM_AUTH_TOKEN not detected.")
          console.log("We detect this PR was created from a forked repository. If you'd like to publish a preview, you must do so from a pull request in your own repository.")
          console.log("Remember to change the package name in your JSON file to avoid a publishing error and provide NPM_AUTH_TOKEN in your repository's secrets.")
        }
        // case 2.2
        else {
          console.log("NPM_AUTH_TOKEN not detected. This either means you forgot to add it to your secrets of your repository.")
        }
        core.setFailed("Halting workflow.")
      }
    }
    // for commits
    else {
      // case 3
      if (github.context.payload.repository.fork && !NPM_AUTH_TOKEN) {
        console.log("You're seeing this message because it seems you're on a forked repository and have not supplied an NPM_AUTH_TOKEN in your repository secrets.")
        console.log("If you wish to publish your own package, you will need to update package name in your json file as well.")
        core.setFailed("Halting workflow.")
      }
      else {
        // case 4
        const regex = /#(\d+)/;
        const commit_message = github.context.payload.head_commit.message;
        if (regex.test(commit_message)) {
          console.log(`Merge #${regex.exec(commit_message)[1]} detected. Resuming workflow.`)
        }
        // case 5
        else {
          console.log("We suspect this workflow wasn't triggered by a commit made from a merge because we could not locate a PR number in the commit message.")
          core.setFailed('Halting workflow')
        }
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  };
};

run();