#!/bin/sh
set -e

cat << "EOT" > dangerfile.js
const { markdown } = require('danger');
const pjson = require('./package.json');

const current = `https://www.npmjs.com/package/${pjson.name}/v/${pjson.version}`
const message = `You can view the NPM package [here](${current}).`
const install = `npm install ${pjson.name}@${pjson.version}`;
// const tag = `npm install ${pjson.name}@${process.env.GITHUB_HEAD_REF}`;

markdown(`This PR is available to use:\n\`\`\`bash\n${install}\n\`\`\`\n${message}`)
EOT

yarn global add danger --dev
export PATH="$(yarn global bin):$PATH"
danger ci