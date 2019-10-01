const core = require('@actions/core');
const github = require('@actions/github');

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = new github.GitHub(GITHUB_TOKEN);

async function run() {
  try {
    const regex = /#(\d+)/;
    const commit_message = github.context.payload.head_commit.message;
    const pull_number = regex.exec(commit_message)[1];

    const pull_request = await octokit.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number
    });

    const labels = pull_request.data.labels.map(labels => { return labels.name });

    core.setOutput('PR_LABELS', labels);
  } catch (error) {
    core.setFailed(error.message);
  };
};

run();