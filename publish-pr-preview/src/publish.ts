import { exec, Process } from "@effection/process";
import { all, Operation } from "effection";
import fs from "fs";
import semver from "semver";

interface PublishRun {
  directoriesToPublish: string[];
  installScript: string;
  branch: string
}

export function* publish({ directoriesToPublish, installScript, branch }: PublishRun): Operation<string[]> {
  // detect for workspace to compare with directoresToPublish to see which one to install separately
    // ❌ bad idea; we don't know what kind of setup users will have in their monorepo
  // setup npmrc? - may or may not be necessary
    // this should happen before install as projects might have private dependencies
  let installCommand = installScript || fs.existsSync("yarn.lock") ? "yarn install --frozen-lockfile" : "npm ci";
  let tag = branch.replace(/(?!.\_)\_/g, "__").replace(/\//g, "_");

  yield exec(installCommand).join();

  let published: string[] = [];
  yield all(
    directoriesToPublish.map(directory =>
      function* () {
        let { name, version, private: privatePackage } = JSON.parse(
          fs.readFileSync(`${directory}/package.json`, { encoding: "utf-8" })
        );
        if (!privatePackage) {
          let npmViewVersions: Process = yield exec(`npm view ${name} versions --json`);
          let everyPublishedVersions = JSON.parse(yield npmViewVersions.stdout.text().expect());
          let previouslyPublishedPreview = yield exec(`npm view ${name}@${tag}`).expect();
          let basePreviewVersion = previouslyPublishedPreview
            ? yield exec(`npm view ${name}@${tag} version`)
            : version;
          let maxSatisfying = semver.maxSatisfying(everyPublishedVersions, "^"+basePreviewVersion);
          let increaseFrom = maxSatisfying || basePreviewVersion;
          let previewVersionToPublish = semver.inc(increaseFrom, "prerelease", tag);
            // ? what happens if we try to publish same version twice
              // attempt another interval bump if it fails?
            // ⚠️ test out cwd of exec in test first for the remaining steps
              // npm version x --no-git-tag-version
              // npm publish --access=public --tag tag
                // if successful publish, add package name and version to array for comment
          console.log("WIP:", published, previewVersionToPublish);
        }
      }
    )
  );
  return [""];
}
