const core = require('@actions/core');
const github = require('@actions/github');

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = new github.GitHub(GITHUB_TOKEN);

// check conmmit to see merged by looking for #1-9
// check if fork

async function run() {
  try {
    // let commit_regexed = /#(\d+)/.exec(github.context.payload.head_commit.message)[1];

    const pull_request = await octokit.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      // state: 'closed', //because we only care about merged
      // head: github.context.ref //only pull request merged to the branch we're on
      pull_number: /#(\d+)/.exec(github.context.payload.head_commit.message)[1]
    });

    console.log(pull_request);

    // const match_commit = pullrequests.data.filter((pr) => { return pr.merged_at != null })[0];

    // console.log("Retrieving labels from merge #" + lastmerged.number + ".");

    // const labels = lastmerged.labels.map(labels => { return labels.name });

    // core.setOutput('PR_LABELS', labels);
  } catch (error) {
    core.setFailed(error.message);
  };
};

run();