import { exec, ExecError, ProcessResult } from "@effection/process";
import { all, Operation } from "effection";
import fs from "fs";
import semver from "semver";
import { colors, logIterable } from "@frontside/actions-utils";
import { stderr } from "process";

interface PublishRun {
  directoriesToPublish: string[];
  installScript: string;
  branch: string
}

export interface PublishedPackages {
  packageName: string;
  version: string;
}

export interface FailedPublish {
  packageName: string;
  versions: string[];
}

export interface PublishResults {
  tag: string;
  publishedPackages: PublishedPackages[];
  unsuccessfulPublishes: FailedPublish[];
}

export function* publish({ directoriesToPublish, installScript, branch }: PublishRun): Operation<PublishResults> {
  let installCommand = installScript || fs.existsSync("yarn.lock") ? "yarn install --frozen-lockfile" : "npm ci";
  let tag = branch.replace(/\_/g, "-").replace(/\//g, "-");
  let published: PublishedPackages[] = [];
  let failedPublishes: FailedPublish[] = [];
  let privatePackages: string[] = [];

  console.log(
    colors.yellow("Installing with command"),
    colors.blue(installCommand)+colors.yellow("...\n"),
  );
  yield exec(installCommand).join();
  console.log(colors.yellow("Publishing packages...\n"));

  yield all(
    directoriesToPublish.map(directory =>
      function* () {
        console.log(`Executing in directory: ${directory}`);
        let { name, version, private: privatePackage } = JSON.parse(
          fs.readFileSync(`${directory}/package.json`, { encoding: "utf-8" })
        );
        if (!privatePackage) {
          let increaseFrom: string = yield npmView({ name, version, tag });

          let publishAttempt: {
            publishedVersion: string;
            attemptedVersions: string[];
          } = yield attemptPublish({ name, increaseFrom, tag, directory, attemptCount: 3 });

          if (publishAttempt.publishedVersion) {
            published = [...published, { packageName: name, version: publishAttempt.publishedVersion }];
          } else {
            failedPublishes = [...failedPublishes, { packageName: name, versions: publishAttempt.attemptedVersions }];
          }
        } else {
          privatePackages = [...privatePackages, name];
        }
      }
    )
  );

  logIterable(
    "The following packages were skipped because they are marked private:",
    privatePackages,
  );

  logIterable(
    "The following preview packages were published:",
    published.map(pkg => `${colors.blue(pkg.packageName)+colors.yellow("@")+colors.blue(pkg.version)}`),
    "This workflow run did not publish any preview packages"
  );

  return {
    tag,
    publishedPackages: published,
    unsuccessfulPublishes: failedPublishes,
  };
}

function* attemptPublish ({
  name,
  increaseFrom,
  tag,
  directory,
  attemptCount,
}:{
  name: string,
  increaseFrom: string,
  tag: string,
  directory: string,
  attemptCount: number,
}) {
  let bumpVersion = (version: string, tag: string) => semver.inc(version, "prerelease", tag) || "";
  let attemptedVersions: string[] = [];
  while (attemptCount > 0) {
    increaseFrom = bumpVersion(increaseFrom, tag);

    let version: ProcessResult = yield exec(`npm version ${increaseFrom} --no-git-tag-version`, { cwd: directory }).join();
    console.log(`---STDOUT: \n${version.stdout}----`);
    if (version.code !== 0) {
      console.error(`---STDERR: \n${version.stderr}---`);
      throw new Error(`Failed to set the new version number with "npm version ${increaseFrom} --no-git-tag-version"`);
    }

    console.log(
      colors.yellow("  Attempting to publish"),
      colors.blue(increaseFrom),
      colors.yellow("of"),
      colors.blue(name),
      colors.yellow("...")
    );
    let publishAttempt: ProcessResult = yield exec(`npm publish --access=public --tag=${tag}`, { cwd: directory }).join();

    if (publishAttempt.code === 0) {
      return {
        publishedVersion: increaseFrom,
      };
    }
    attemptedVersions = [...attemptedVersions, increaseFrom];
    attemptCount--;
  }
  return {
    attemptedVersions,
  };
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
    let versionsParsed = JSON.parse(stdoutVersions);
    let versionsArray = Array.isArray(versionsParsed) && versionsParsed || [versionsParsed];
    let everyRelevantPublishedVersions = versionsArray.filter((version: string) => {
      let prerelease = semver.prerelease(version);
      return prerelease && prerelease[0] == tag || !prerelease;
    });

    let { stdout: previouslyPublishedPreview }: ProcessResult = yield exec(`npm view ${name}@${tag}`).expect();
    let { stdout: previousPreviewVersion }: ProcessResult = yield exec(`npm view ${name}@${tag} version`).expect();

    let basePreviewVersion = previouslyPublishedPreview
      ? previousPreviewVersion
      : version;

    let maxSatisfying = semver.maxSatisfying(everyRelevantPublishedVersions, "^"+basePreviewVersion, { includePrerelease: true });

    return maxSatisfying || basePreviewVersion;
  }
}
