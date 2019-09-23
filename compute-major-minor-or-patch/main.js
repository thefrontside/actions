const core = require('@actions/core');

const labels = core.getInput('PR_LABELS');

async function run() {
  try {
    if (labels != null) {
      if (labels.includes('major')) {
        core.setFailed('Major releases should be done manually.')
      } else if (labels.includes('minor')) {
        core.exportVariable('MAJOR_OR_MINOR_OR_PATCH', 'minor');
      } else if (labels.includes('patch') && !labels.includes('minor')) {
        core.exportVariable('MAJOR_OR_MINOR_OR_PATCH', 'patch');
      } else {
        console.log("There were no applicable labels so resorting to 'patch'.")
        core.exportVariable('MAJOR_OR_MINOR_OR_PATCH', 'patch');
      }
    } else {
      console.log("There were no labels in the last merged PR. Defaulting to patch.")
      core.exportVariable('MAJOR_OR_MINOR_OR_PATCH', 'patch');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();