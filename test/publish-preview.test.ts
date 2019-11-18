import { describe, it } from 'mocha';
import * as expect from 'expect';
import { actions } from './helpers';
import { Output } from './helpers/spawn';

describe('publishing a preview package', () => {

  describe('when a PR event happens within the repository', () => {
    let output: Output;
    beforeEach(async () => {
      output = await actions.run('publish-pr-preview', {
        headRef: 'cool-branch',
        change: {
          'index.js': 'export default { hello: "world" }'
        },
        env: {
          NPM_AUTH_TOKEN: 'toky-mctoken'
        },
        event: {
          action: 'synchronize',
          pull_request: {
            base: {
              repo: {
                url: 'https://github.com/coolperson/coolproj.git'
              }
            },
            head: {
              repo: {
                url: 'https://github.com/coolperson/coolproj.git'
              }
            }
          }
        }
      });
    });

    it('publishes the preview package to NPM with a SHA', () => {
      expect(output.stdout).toMatch(/\+ coolpackage@1.0.0-\w{7}/)
    });
  });
});
