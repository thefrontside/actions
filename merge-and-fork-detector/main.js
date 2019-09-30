const core = require('@actions/core');
const github = require('@actions/github');

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = new github.GitHub(GITHUB_TOKEN);

// check conmmit to see merged by looking for #1-9
// check if fork

async function run() {
  try {
    const pullrequests = await octokit.pulls.list({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      state: 'closed', //because we only care about merged
      head: github.context.ref //only pull request merged to the branch we're on
    });

    const shouldbefour = pullrequests.data.filter((pr) => { return pr.number == 4 });

    console.log("4:", shouldbefour);

    console.log('commit message:', github.context.payload.head_commit.message);

    // const lastmerged = pullrequests.data.filter((pr) => { return pr.merged_at != null })[0];

    // console.log("Retrieving labels from merge #" + lastmerged.number + ".");

    // const labels = lastmerged.labels.map(labels => { return labels.name });

    // core.setOutput('PR_LABELS', labels);
  } catch (error) {
    core.setFailed(error.message);
  };
};

run();