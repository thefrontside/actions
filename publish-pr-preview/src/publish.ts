import { exec, Process, ProcessResult } from "@effection/process";
import { all, Operation } from "effection";
import fs from "fs";
import semver from "semver";

interface PublishRun {
  directoriesToPublish: string[];
  installScript: string;
  branch: string
}

export interface PublishedPackages {
  packageName: string;
  version: string;
}

export interface PublishResults {
  publishedPackages: PublishedPackages[];
  tag: string;
}

export function* publish({ directoriesToPublish, installScript, branch }: PublishRun): Operation<PublishResults> {
  // setup npmrc? - may or may not be necessary
    // this should happen before install as projects might have private dependencies
  let installCommand = installScript || fs.existsSync("yarn.lock") ? "yarn install --frozen-lockfile" : "npm ci";
  let tag = branch.replace(/(?!.\_)\_/g, "__").replace(/\//g, "_");
  let published: Iterable<PublishedPackages> = [];

  yield exec(installCommand).join();
  yield all(
    directoriesToPublish.map(directory =>
      function* () {
        let { name, version, private: privatePackage } = JSON.parse(
          fs.readFileSync(`${directory}/package.json`, { encoding: "utf-8" })
        );
        if (!privatePackage) {
          let increaseFrom: string = yield npmView({ name, version, tag });
          // ⚠️ try running this with @minkimcello/georgia (and add your NPM token to github actions secrets)
          // ⚠️ utilize the multiple attempt functionality too
          let successfullyPublishedVersion: string | boolean = yield attemptPublish({ increaseFrom, tag, directory, attemptCount: 3 });
          if (successfullyPublishedVersion) {
            published = [...published, { packageName: name, version: successfullyPublishedVersion }];
          }
        }
      }
    )
  );
  return {
    tag,
    publishedPackages: published,
  };
}

function* attemptPublish ({
  increaseFrom,
  tag,
  directory,
  attemptCount,
}:{
  increaseFrom: string,
  tag: string,
  directory: string,
  attemptCount: number,
}) {
  let bumpVersion = (version: string) => semver.inc(version, "prerelease", tag) || "";
  while (attemptCount > 0) {
    increaseFrom = bumpVersion(increaseFrom);
    yield exec(`npm version ${increaseFrom} --no-git-tag-version`, { cwd: directory }).expect();
    let publishAttempt: ProcessResult = yield exec(`npm publish --access=public --tag ${tag}`, { cwd: directory }).join();
    if (publishAttempt.code === 0) {
      return increaseFrom;
    }
  }
  return false;
}

function* npmView ({
  name,
  version,
  tag,
}:{
  name: string,
  version: string,
  tag: string,
}) {
  let newPackage: ProcessResult = yield exec(`npm view ${name}`).join();
  if (newPackage.code === 1) {
    return version;
  } else {
    let { stdout: stdoutVersions }: ProcessResult = yield exec(`npm view ${name} versions --json`).expect();
    let everyPublishedVersions = JSON.parse(stdoutVersions);

    let previouslyPublishedPreview: Process = yield exec(`npm view ${name}@${tag}`).expect();
    let { stdout: previousPreviewVersion }: ProcessResult = yield exec(`npm view ${name}@${tag} version`).expect();

    let basePreviewVersion = previouslyPublishedPreview
      ? previousPreviewVersion
      : version;

    let maxSatisfying = semver.maxSatisfying(everyPublishedVersions, "^"+basePreviewVersion);
    return maxSatisfying || basePreviewVersion;
  }
}
